import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Box, Button, Tooltip, Typography } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import {
  useModulesManager,
  useTranslations,
  useAsyncJob,
  useGraphqlQuery,
  Form,
  ProgressOrError,
  PublishedComponent,
  Link,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { makeStyles } from "@material-ui/styles";

import { MSR_ETL_MODULE_NAME, MSR_ETL_JOB_TYPE, RIGHT_MSR_ETL_EXPORT } from "../../constants";
import DynamicFiltersPanel from "../../components/DynamicFiltersPanel";
import { scheduleMsrUbrLocationsImport, clearScheduleUbrLocationsImport, fetchActiveMsrEtlJob } from "../../actions";
import { translateMsrEtlError } from "../../util/errors";
import { schemaRequiredFieldsSatisfied } from "../../util/dynamicFilters";

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

  const schedulingUbrLocationsImport = useSelector((state) => state.msrEtl.schedulingUbrLocationsImport);
  const errorScheduleUbrLocationsImport = useSelector((state) => state.msrEtl.errorScheduleUbrLocationsImport);
  const scheduledUbrLocationsImportClientMutationId = useSelector(
    (state) => state.msrEtl.scheduledUbrLocationsImportClientMutationId,
  );

  useEffect(() => {
    dispatch(fetchActiveMsrEtlJob(MSR_ETL_JOB_TYPE.UBR_LOCATIONS_IMPORT));
  }, []);

  const {
    isLoading: checkingLocationsExist,
    data: locationsExistData,
    error: errorLocationsExist,
    refetch: refetchLocationsExist,
  } = useGraphqlQuery(`query MsrEtlLocationsExist { locations(first: 1) { edges { node { id } } } }`);
  const locationsExist = checkingLocationsExist
    ? null
    : !!errorLocationsExist || (locationsExistData?.locations?.edges?.length ?? 0) > 0;

  const isImportTracked = !!scheduledUbrLocationsImportClientMutationId;
  const { isTerminal: isTrackedJobTerminal } = useAsyncJob({
    clientMutationId: isImportTracked ? scheduledUbrLocationsImportClientMutationId : undefined,
  });

  const blockedByActiveJob = isImportTracked && !isTrackedJobTerminal;

  useEffect(() => {
    if (isTrackedJobTerminal && locationsExist === false) {
      refetchLocationsExist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrackedJobTerminal]);

  const locationSourceTypes = useSelector((state) => state.msrEtl.locationSourceTypes);
  const schema = locationSourceTypes.find((sourceType) => sourceType.value === edited.sourceType)?.filterSchema;
  const canPullData = !!edited.sourceType && schemaRequiredFieldsSatisfied(schema, edited.filters, edited.location);

  const persistFilters = (data) => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const onPullData = (data) => {
    persistFilters(data);
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport({ sourceType: data.sourceType, filters: data.filters }));
  };

  const onInitialPull = () => {
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport());
  };

  const onClear = () => {
    dispatch(clearScheduleUbrLocationsImport());
    localStorage.removeItem(STORAGE_KEY);
    setEdited({});
  };

  return (
    <div>
      <Form
        module={MSR_ETL_MODULE_NAME}
        enableSaveButton={false}
        edited={edited}
        onEditedChanged={setEdited}
        HeadPanel={locationsExist ? DynamicFiltersPanel : undefined}
        kind="location"
        actions={[]}
        rights={rights}
      />
      {locationsExist === false && (
        <Box m={2}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage("etlServices.noLocations")}
          </Typography>
        </Box>
      )}
      <Box className={classes.actions}>
        {locationsExist && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onPullData(edited)}
            disabled={schedulingUbrLocationsImport || !canPullData || blockedByActiveJob}
          >
            {formatMessage("filters.pullData")}
          </Button>
        )}
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
        {locationsExist && (
          <Button variant="outlined" onClick={onClear} disabled={blockedByActiveJob}>
            {formatMessage("filters.clear")}
          </Button>
        )}
      </Box>

      {isImportTracked ? (
        <Box mt={2}>
          <PublishedComponent
            pubRef="core.AsyncJobProgress"
            clientMutationId={scheduledUbrLocationsImportClientMutationId}
            actions={
              <Button
                size="small"
                variant="outlined"
                component={Link}
                to={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${scheduledUbrLocationsImportClientMutationId}`}
              >
                {formatMessage("etlServices.viewSyncLog")}
              </Button>
            }
          />
        </Box>
      ) : (
        <ProgressOrError
          progress={schedulingUbrLocationsImport}
          error={translateMsrEtlError(errorScheduleUbrLocationsImport, formatMessage)}
        />
      )}
    </div>
  );
}

export default injectIntl(withTheme(withStyles({})(LocationImportTab)));
