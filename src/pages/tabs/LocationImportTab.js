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

import {
  DEFAULT_SOURCE_TYPE,
  IMPORTED_RECORDS_ROUTE,
  MSR_ETL_MODULE_NAME,
  MSR_ETL_JOB_TYPE,
  RIGHT_MSR_ETL_EXPORT,
} from "../../constants";
import DynamicFiltersPanel from "../../components/DynamicFiltersPanel";
import {
  scheduleMsrUbrLocationsImport,
  clearScheduleUbrLocationsImport,
  fetchActiveMsrEtlJob,
  fetchMsrEtlSourceTypes,
} from "../../actions";
import { translateMsrEtlError } from "../../util/errors";
import { msrEtlMetricLabels } from "../../util/jobMetrics";
import ImportResultAlert from "../../components/ImportResultAlert";
import ImportProgressCard from "../../components/ImportProgressCard";
import { renderInAlertSlot } from "../../util/alertSlot";
import FormLoader from "../../components/FormLoader";
import { schemaRequiredFieldsSatisfied } from "../../util/dynamicFilters";

const STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_location_v2`;
const LEGACY_STORAGE_KEY = `${MSR_ETL_MODULE_NAME}_filters_location`;

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
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LocationImportTab({ intl, rights, alertSlot }) {
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
  const sourceTypesFetched = useSelector((state) => state.msrEtl.fetchedMsrEtlSourceTypes);
  // A failed fetch counts as done, so the tab never waits on it forever
  const sourceTypesSettled = useSelector(
    (state) => state.msrEtl.fetchedMsrEtlSourceTypes || !!state.msrEtl.errorMsrEtlSourceTypes,
  );
  // The filters panel fetches these too, but it is hidden until we know an upload source exists
  useEffect(() => {
    if (!sourceTypesFetched) dispatch(fetchMsrEtlSourceTypes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Messages name the tracked job's data source ("downloaded from Public Works Program (PWP)"),
  // not the programme, and not whichever one is picked now
  const jobSourceType = useSelector((state) => state.msrEtl.scheduledUbrLocationsImportSourceType);
  const sourceLabel = locationSourceTypes.find((sourceType) => sourceType.value === jobSourceType)?.sourceName;
  const schema = locationSourceTypes.find((sourceType) => sourceType.value === edited.sourceType)?.filterSchema;
  const canPullData = !!edited.sourceType && schemaRequiredFieldsSatisfied(schema, edited.filters, edited.location);
  // A source without a location filter (e.g. an uploaded location list) can run before any location exists
  const uploadSourceAvailable = locationSourceTypes.some(
    (sourceType) => !(sourceType.filterSchema || []).some((field) => field.type === "location"),
  );
  const showFilters = locationsExist || uploadSourceAvailable;
  // The initial pull is the full MSR country import, so only where the MSR source is offered
  const msrSourceAvailable = locationSourceTypes.some((sourceType) => sourceType.value === DEFAULT_SOURCE_TYPE);

  const persistFilters = (data) => {
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    persistFilters(edited);
  }, [edited]);

  const onPullData = (data) => {
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport({ sourceType: data.sourceType, filters: data.filters }));
  };

  const onInitialPull = () => {
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport());
  };

  const onClear = () => {
    dispatch(clearScheduleUbrLocationsImport());
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
              clientMutationId={scheduledUbrLocationsImportClientMutationId}
              metricLabels={msrEtlMetricLabels(formatMessage)}
              progressUnit={formatMessage("jobProgress.locations")}
              renderRunning={(job, progress) => (
                <ImportProgressCard
                  source={sourceLabel}
                  job={job}
                  {...progress}
                  kind="locations"
                  syncLogRoute={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${scheduledUbrLocationsImportClientMutationId}`}
                />
              )}
              renderResult={(job) => (
                <ImportResultAlert
                  source={sourceLabel}
                  job={job}
                  kind="locations"
                  route={IMPORTED_RECORDS_ROUTE.locations}
                  syncLogRoute={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${scheduledUbrLocationsImportClientMutationId}`}
                />
              )}
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
        ),
      )}
      {locationsExist === null || (locationsExist === false && !sourceTypesSettled) ? (
        <FormLoader />
      ) : (
        <Form
          flat
          module={MSR_ETL_MODULE_NAME}
          enableSaveButton={false}
          edited={edited}
          onEditedChanged={setEdited}
          HeadPanel={showFilters ? DynamicFiltersPanel : undefined}
          kind="location"
          actions={[]}
          rights={rights}
        />
      )}
      {locationsExist === false && sourceTypesSettled && !uploadSourceAvailable && (
        <Box m={2}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage("etlServices.noLocations")}
          </Typography>
        </Box>
      )}
      <Box className={classes.actions}>
        {showFilters && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onPullData(edited)}
            disabled={schedulingUbrLocationsImport || !canPullData || blockedByActiveJob}
          >
            {formatMessage("filters.pullData")}
          </Button>
        )}
        {rights.includes(RIGHT_MSR_ETL_EXPORT) && msrSourceAvailable && (
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
        {showFilters && (
          <Button variant="outlined" onClick={onClear} disabled={blockedByActiveJob}>
            {formatMessage("filters.clear")}
          </Button>
        )}
      </Box>
    </div>
  );
}

export default injectIntl(withTheme(withStyles({})(LocationImportTab)));
