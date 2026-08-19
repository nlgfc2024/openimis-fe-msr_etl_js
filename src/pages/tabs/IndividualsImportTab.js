import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Box, Button } from "@material-ui/core";
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

import { MSR_ETL_MODULE_NAME, MSR_ETL_JOB_TYPE } from "../../constants";
import HouseholdFiltersPanel from "../../components/HouseholdFiltersPanel";
import {
  scheduleMsrUbrIndividualsImport,
  clearScheduleUbrIndividualsImport,
  fetchActiveMsrEtlJob,
} from "../../actions";
import { normalizeLocationSelection } from "../../util/location";
import { translateMsrEtlError } from "../../util/errors";

const STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_individuals`;

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
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

function IndividualsImportTab({ intl, rights }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const [edited, setEdited] = useState(() => loadSavedFilters() || {});

  const scheduling = useSelector((state) => state.msrEtl.schedulingUbrIndividualsImport);
  const rawError = useSelector((state) => state.msrEtl.errorScheduleUbrIndividualsImport);
  const clientMutationId = useSelector((state) => state.msrEtl.scheduledUbrIndividualsImportClientMutationId);

  useEffect(() => {
    dispatch(fetchActiveMsrEtlJob(MSR_ETL_JOB_TYPE.UBR_INDIVIDUALS_IMPORT));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isImportTracked = !!clientMutationId;
  const { isTerminal: isTrackedJobTerminal } = useAsyncJob({
    clientMutationId: isImportTracked ? clientMutationId : undefined,
  });
  // duplicate-submission guard: a matching job is still RECEIVED/QUEUED/RUNNING
  const blockedByActiveJob = isImportTracked && !isTrackedJobTerminal;

  const normalizedLocation = normalizeLocationSelection(edited.location);
  const mandatoryFieldsEmpty =
    !normalizedLocation.district || !normalizedLocation.ta || (normalizedLocation.village && !normalizedLocation.gvh);

  const save = (data) => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const onPullData = () => {
    save(edited);
    dispatch(scheduleMsrUbrIndividualsImport(edited));
  };

  const onClear = () => {
    dispatch(clearScheduleUbrIndividualsImport());
    localStorage.removeItem(STORAGE_KEY);
    setEdited({});
  };

  return (
    <div>
      <Form
        module={MSR_ETL_MODULE_NAME}
        save={save}
        edited={edited}
        onEditedChanged={setEdited}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={() => !mandatoryFieldsEmpty}
        HeadPanel={HouseholdFiltersPanel}
        actions={[]}
        rights={rights}
      />
      <Box className={classes.actions}>
        <Button
          variant="contained"
          color="primary"
          onClick={onPullData}
          disabled={scheduling || mandatoryFieldsEmpty || blockedByActiveJob}
        >
          {formatMessage("filters.pullData")}
        </Button>
        <Button variant="outlined" onClick={onClear} disabled={blockedByActiveJob}>
          {formatMessage("filters.clear")}
        </Button>
      </Box>

      {isImportTracked ? (
        <Box mt={2}>
          <PublishedComponent
            pubRef="core.AsyncJobProgress"
            clientMutationId={clientMutationId}
            actions={
              <Button
                size="small"
                variant="outlined"
                component={Link}
                to={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${clientMutationId}`}
              >
                {formatMessage("filters.viewSyncLog")}
              </Button>
            }
          />
        </Box>
      ) : (
        <ProgressOrError progress={scheduling} error={translateMsrEtlError(rawError, formatMessage)} />
      )}
    </div>
  );
}

export default injectIntl(withTheme(withStyles({})(IndividualsImportTab)));
