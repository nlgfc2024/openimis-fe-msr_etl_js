import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Box, Button, Typography } from "@material-ui/core";
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

import { IMPORTED_RECORDS_ROUTE, MSR_ETL_MODULE_NAME, MSR_ETL_JOB_TYPE } from "../../constants";
import DynamicFiltersPanel from "../../components/DynamicFiltersPanel";
import {
  scheduleMsrUbrIndividualsImport,
  clearScheduleUbrIndividualsImport,
  fetchActiveMsrEtlJob,
} from "../../actions";
import { schemaRequiredFieldsSatisfied } from "../../util/dynamicFilters";
import { translateMsrEtlError } from "../../util/errors";
import { msrEtlMetricLabels } from "../../util/jobMetrics";
import ImportResultAlert from "../../components/ImportResultAlert";
import ImportProgressCard from "../../components/ImportProgressCard";
import { renderInAlertSlot } from "../../util/alertSlot";
import FormLoader from "../../components/FormLoader";

const STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_individuals_v2`;
const LEGACY_STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_individuals`;

const useStyles = makeStyles((theme) => ({
  actions: {
    display: "flex",
    gap: theme.spacing(2),
    margin: theme.spacing(2),
  },
}));

function loadSavedFilters() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function IndividualsImportTab({ intl, rights, alertSlot }) {
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

  const {
    isLoading: checkingLocationsExist,
    data: locationsExistData,
    error: errorLocationsExist,
  } = useGraphqlQuery(`query MsrEtlLocationsExist { locations(first: 1) { edges { node { id } } } }`);
  const locationsExist = checkingLocationsExist
    ? null
    : !!errorLocationsExist || (locationsExistData?.locations?.edges?.length ?? 0) > 0;

  const isImportTracked = !!clientMutationId;
  const { isTerminal: isTrackedJobTerminal } = useAsyncJob({
    clientMutationId: isImportTracked ? clientMutationId : undefined,
  });

  const blockedByActiveJob = isImportTracked && !isTrackedJobTerminal;

  const individualSourceTypes = useSelector((state) => state.msrEtl.individualSourceTypes);
  // Messages name the tracked job's data source ("downloaded from Public Works Program (PWP)"),
  // not the programme, and not whichever one is picked now
  const jobSourceType = useSelector((state) => state.msrEtl.scheduledUbrIndividualsImportSourceType);
  const sourceLabel = individualSourceTypes.find((sourceType) => sourceType.value === jobSourceType)?.sourceName;
  const schema = individualSourceTypes.find((sourceType) => sourceType.value === edited.sourceType)?.filterSchema;
  const mandatoryFieldsEmpty =
    !edited.sourceType || !schemaRequiredFieldsSatisfied(schema, edited.filters, edited.location);

  const persistFilters = (data) => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    persistFilters(edited);
  }, [edited]);

  const onPullData = (data) => {
    dispatch(scheduleMsrUbrIndividualsImport({ sourceType: data.sourceType, filters: data.filters }));
  };

  const onClear = () => {
    dispatch(clearScheduleUbrIndividualsImport());
    setEdited({ sourceType: edited.sourceType });
  };

  return (
    <div>
      {renderInAlertSlot(
        alertSlot,
        isImportTracked ? (
          <Box>
            <PublishedComponent
              pubRef="core.AsyncJobProgress"
              clientMutationId={clientMutationId}
              metricLabels={msrEtlMetricLabels(formatMessage)}
              progressUnit={formatMessage("jobProgress.individuals")}
              renderRunning={(job, progress) => (
                <ImportProgressCard
                  source={sourceLabel}
                  job={job}
                  {...progress}
                  kind="individuals"
                  syncLogRoute={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${clientMutationId}`}
                />
              )}
              renderResult={(job) => (
                <ImportResultAlert
                  source={sourceLabel}
                  job={job}
                  kind="individuals"
                  route={IMPORTED_RECORDS_ROUTE.individuals}
                  syncLogRoute={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${clientMutationId}`}
                />
              )}
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
        ),
      )}
      {locationsExist === null ? (
        <FormLoader />
      ) : (
        <Form
          flat
          module={MSR_ETL_MODULE_NAME}
          enableSaveButton={false}
          edited={edited}
          onEditedChanged={setEdited}
          HeadPanel={locationsExist ? DynamicFiltersPanel : undefined}
          kind="individual"
          actions={[]}
          rights={rights}
        />
      )}
      {locationsExist === false && (
        <Box m={2}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage("etlServices.individualsNeedLocations")}
          </Typography>
        </Box>
      )}
      <Box className={classes.actions}>
        {locationsExist && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onPullData(edited)}
            disabled={scheduling || mandatoryFieldsEmpty || blockedByActiveJob}
          >
            {formatMessage("filters.pullData")}
          </Button>
        )}
        {locationsExist && (
          <Button variant="outlined" onClick={onClear} disabled={blockedByActiveJob}>
            {formatMessage("filters.clear")}
          </Button>
        )}
      </Box>
    </div>
  );
}

export default injectIntl(withTheme(withStyles({})(IndividualsImportTab)));
