// Disable due to core architecture
/* eslint-disable camelcase */
import { graphql, graphqlMutation, formatQuery } from "@openimis/fe-core";
import { ACTION_TYPE } from "./reducer";
import { CLEAR } from "./util/action-type";
import { getLocationFilterParams } from "./util/location";

// ---------------------
// Field projections
// ---------------------

const ETL_SERVICES_PROJECTION = () => ["etlServices { nameOfService }"];

// formatQuery expects an array of pre-formatted "key: value" filter strings, not a plain object.
function buildFilters(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => (typeof value === "number" ? `${key}: ${value}` : `${key}: "${value}"`));
}

// ---------------------
// Queries
// ---------------------

export function fetchMsrEtlServices() {
  const payload = formatQuery("msrEtlServicesByServiceName", [], ETL_SERVICES_PROJECTION());
  return graphql(payload, ACTION_TYPE.FETCH_ETL_SERVICES);
}

const EXECUTE_ETL_SERVICE_MUTATION = `
  mutation executeMsrEtlService($input: MsrEtlServiceMutationInput!) {
    executeMsrEtlService(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

export function executeMsrEtlService(serviceName, filters = {}) {
  const input = { nameOfService: serviceName };
  if (filters.location?.district) input.district = filters.location.district;
  if (filters.location?.ta) input.ta = filters.location.ta;
  if (filters.location?.village) input.village = filters.location.village;
  if (filters.classifications?.length) input.classification = filters.classifications.map((c) => c.value);
  if (filters.percentile != null) {
    input.lowerPercentileCategory = 0;
    input.upperPercentileCategory = filters.percentile;
  }
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  return graphqlMutation(EXECUTE_ETL_SERVICE_MUTATION, { input }, ACTION_TYPE.EXECUTE_ETL_SERVICE);
}

/**
 * Fetch UBR locations filtered by geographic location codes.
 * Normalizes location filters and queries location data from MSR ETL service.
 *
 * @param {object} filters - Filter object with optional location property
 * @param {object} filters.location - Location codes (district, ta, village)
 * @returns {object} Redux action for location fetch
 */
export function fetchMsrUbrLocations(filters = {}) {
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

  const payload = formatQuery("msrUbrLocations", buildFilters(params), projection);
  return graphql(payload, ACTION_TYPE.FETCH_UBR_LOCATIONS);
}

export function scheduleUbrLocationInitialPull() {
  const payload = `mutation ImportLocations {
    executeMsrEtlService(input: { nameOfService: "UBRLocationService" }) {
      clientMutationId
      internalId
    }
  }`;
  return graphql(payload, ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL);
}

export function fetchUbrLocationInitialPullStatus(requestId) {
  const normalizedRequestId = typeof requestId === "string" ? requestId.trim() : "";
  if (!normalizedRequestId) {
    return () => undefined;
  }

  const payload = formatQuery(
    "msrUbrLocationInitialPullStatus",
    buildFilters({ requestId: normalizedRequestId }),
    ["requestId", "status", "message", "startedAt", "finishedAt", "updatedAt"],
  );
  return graphql(payload, ACTION_TYPE.FETCH_UBR_LOCATION_INITIAL_PULL_STATUS, { requestId: normalizedRequestId });
}

// ---------------------
// Clear actions
// ---------------------

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearMsrEtlExecution = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.EXECUTE_ETL_SERVICE) });
};

export const clearMsrUbrLocations = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_UBR_LOCATIONS) });
};

export const clearScheduleUbrLocationInitialPull = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL) });
};
