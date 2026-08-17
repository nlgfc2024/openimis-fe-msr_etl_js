// Disable due to core architecture
/* eslint-disable camelcase */
import { graphql, graphqlWithVariables, formatQuery, formatPageQueryWithCount } from "@openimis/fe-core";
import { ACTION_TYPE } from "./reducer";
import { CLEAR } from "./util/action-type";
import { getLocationFilterParams } from "./util/location";
import { buildIndividualsImportInput } from "./util/individualsImportInput";

function buildFilters(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => (typeof value === "number" ? `${key}: ${value}` : `${key}: "${value}"`));
}

// crypto.randomUUID requires a secure context; fall back on plain HTTP
function generateClientMutationId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const ACTIVE_JOB_STATUSES_GQL = "[RECEIVED, QUEUED, RUNNING]";

// Duplicate-submission guard: is a matching job already active for this user?
export function fetchActiveMsrEtlJob(jobType) {
  const query = `{
    asyncJobs(module: "msr_etl", jobType: "${jobType}", status_In: ${ACTIVE_JOB_STATUSES_GQL}, first: 1) {
      edges { node { clientMutationId } }
    }
  }`;
  return graphql(query, ACTION_TYPE.FETCH_ACTIVE_MSR_ETL_JOB, { jobType });
}

const SCHEDULE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION = `
  mutation scheduleMsrUbrIndividualsImport($input: ScheduleMsrUbrIndividualsImportMutationInput!) {
    scheduleMsrUbrIndividualsImport(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

// clientMutationId is generated here rather than by fe-core's graphqlMutation
// so it is available for core.AsyncJobProgress as soon as the request fires.
export function scheduleMsrUbrIndividualsImport(filters = {}) {
  const clientMutationId = generateClientMutationId();
  const input = buildIndividualsImportInput(filters);
  input.clientMutationId = clientMutationId;

  return graphqlWithVariables(
    SCHEDULE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION,
    { input },
    ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT,
    { clientMutationId },
  );
}

function buildMsrUbrLocationsPayload(filters = {}) {
  const projection = ["count", "batches { dataType count locations }"];
  const location = filters.location || filters;
  const params = {
    ...getLocationFilterParams(location),
  };

  // Keep explicit passthrough so selected values are never dropped by normalization edge cases.
  if (location?.district) params.district = String(location.district);
  if (location?.ta) params.ta = String(location.ta);
  if (location?.gvh) params.gvh = String(location.gvh);
  if (location?.village) params.village = String(location.village);

  return formatQuery("msrUbrLocations", buildFilters(params), projection);
}

// Populates the District/TA/GVH cascading dropdown options and the sync log
// page's code-to-name lookup.
export function fetchMsrUbrLocationOptions(filters = {}) {
  return graphql(buildMsrUbrLocationsPayload(filters), ACTION_TYPE.FETCH_UBR_LOCATION_OPTIONS);
}

const SCHEDULE_MSR_UBR_LOCATIONS_IMPORT_MUTATION = `
  mutation scheduleMsrUbrLocationsImport($input: ScheduleMsrUbrLocationsImportMutationInput!) {
    scheduleMsrUbrLocationsImport(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

// Unfiltered (no location) schedules a full country-wide import; a location
// filter scopes the job to just that district/ta/gvh/village.
export function scheduleMsrUbrLocationsImport(filters = {}) {
  const clientMutationId = generateClientMutationId();
  const location = filters.location || filters;
  const input = {
    ...getLocationFilterParams(location),
    clientMutationId,
  };

  return graphqlWithVariables(
    SCHEDULE_MSR_UBR_LOCATIONS_IMPORT_MUTATION,
    { input },
    ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT,
    { clientMutationId },
  );
}

export const clearScheduleUbrIndividualsImport = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT) });
};

export const clearScheduleUbrLocationsImport = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT) });
};

const SYNC_UNITS_PROJECTION = [
  "count",
  "totalCount",
  "units { id unitType unitCode stageStatus syncStatus recordCount errorDetail attempts updatedAt }",
];

export function fetchMsrEtlSyncUnits(jobUuid, { unitType, syncStatus, limit = 100, offset = 0 } = {}) {
  const filters = buildFilters({ jobUuid, unitType, syncStatus, limit, offset });
  const payload = formatQuery("msrEtlSyncUnits", filters, SYNC_UNITS_PROJECTION);
  return graphql(payload, ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS);
}

export const clearMsrEtlSyncUnits = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS) });
};

const RECENT_JOBS_PROJECTION = ["uuid", "jobType", "status", "clientMutationId", "createdAt", "finishedAt", "error"];

// params come from Searcher's filtersToQueryParams (pagination/orderBy/defaultFilters)
export function fetchRecentMsrEtlJobs(params) {
  const payload = formatPageQueryWithCount("asyncJobs", params, RECENT_JOBS_PROJECTION);
  return graphql(payload, ACTION_TYPE.FETCH_RECENT_MSR_ETL_JOBS);
}
