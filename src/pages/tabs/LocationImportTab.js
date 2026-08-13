import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Box, Button, Tooltip } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import {
  useModulesManager,
  useTranslations,
  useAsyncJob,
  Form,
  ProgressOrError,
  PublishedComponent,
  Link,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { makeStyles } from "@material-ui/styles";

import { MSR_ETL_MODULE_NAME, MSR_ETL_JOB_TYPE, RIGHT_MSR_ETL_EXPORT } from "../../constants";
import LocationFiltersPanel from "../../components/LocationFiltersPanel";
import {
  fetchMsrUbrLocations,
  clearMsrUbrLocations,
  scheduleMsrUbrLocationsImport,
  clearScheduleUbrLocationsImport,
  fetchActiveMsrEtlJob,
} from "../../actions";
import { translateMsrEtlError } from "../../util/errors";

const STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_location`;

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

function loadSavedFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LocationImportTab({ intl, rights }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const [edited, setEdited] = useState(() => loadSavedFilters() || {});

  const fetchingMsrUbrLocations = useSelector((state) => state.msrEtl.fetchingMsrUbrLocations);
  const errorMsrUbrLocations = useSelector((state) => state.msrEtl.errorMsrUbrLocations);
  const schedulingUbrLocationsImport = useSelector((state) => state.msrEtl.schedulingUbrLocationsImport);
  const errorScheduleUbrLocationsImport = useSelector((state) => state.msrEtl.errorScheduleUbrLocationsImport);
  const scheduledUbrLocationsImportClientMutationId = useSelector(
    (state) => state.msrEtl.scheduledUbrLocationsImportClientMutationId,
  );

  useEffect(() => {
    dispatch(clearMsrUbrLocations());
    dispatch(fetchActiveMsrEtlJob(MSR_ETL_JOB_TYPE.UBR_LOCATIONS_IMPORT));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isImportTracked = !!scheduledUbrLocationsImportClientMutationId;
  const { isTerminal: isTrackedJobTerminal } = useAsyncJob({
    clientMutationId: isImportTracked ? scheduledUbrLocationsImportClientMutationId : undefined,
  });
  // duplicate-submission guard: a matching job is still RECEIVED/QUEUED/RUNNING
  const blockedByActiveJob = isImportTracked && !isTrackedJobTerminal;

  const save = (data) => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const onPullData = () => {
    save(edited);
    dispatch(fetchMsrUbrLocations({ ...edited }));
  };

  const onInitialPull = () => {
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport());
  };

  return (
    <div>
      <Form
        module={MSR_ETL_MODULE_NAME}
        save={save}
        edited={edited}
        onEditedChanged={setEdited}
        HeadPanel={LocationFiltersPanel}
        actions={[]}
        rights={rights}
      />
      <Box className={classes.actions}>
        <Button variant="contained" color="primary" onClick={onPullData} disabled={fetchingMsrUbrLocations}>
          {formatMessage("filters.pullData")}
        </Button>
        {rights.includes(RIGHT_MSR_ETL_EXPORT) && (
          <Tooltip title={formatMessage("etlServices.initialPull.tooltip")}>
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudDownloadIcon />}
                onClick={onInitialPull}
                disabled={schedulingUbrLocationsImport || blockedByActiveJob}
              >
                {formatMessage("etlServices.initialPull")}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>

      <ProgressOrError progress={fetchingMsrUbrLocations} error={errorMsrUbrLocations} />

      {isImportTracked && (
        <Box mt={2}>
          <PublishedComponent
            pubRef="core.AsyncJobProgress"
            clientMutationId={scheduledUbrLocationsImportClientMutationId}
          />
          <Link
            to={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${scheduledUbrLocationsImportClientMutationId}`}
          >
            {formatMessage("etlServices.viewSyncLog")}
          </Link>
        </Box>
      )}
      {!isImportTracked && (
        <ProgressOrError
          progress={schedulingUbrLocationsImport}
          error={translateMsrEtlError(errorScheduleUbrLocationsImport, formatMessage)}
        />
      )}
    </div>
  );
}

export default injectIntl(withTheme(withStyles({})(LocationImportTab)));
