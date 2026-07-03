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
// Helpers
// ---------------------

function extractLocationCodes(location) {
  const codes = {};
  let current = location;
  while (current) {
    if (current.type === "D") codes.district = current.code;
    else if (current.type === "W") codes.ta = current.code;
    else if (current.type === "V") codes.village = current.code;
    current = current.parent ?? null;
  }
  return codes;
}

// ---------------------
// Queries
// ---------------------

export function fetchMsrEtlServices() {
  const payload = formatQuery("msrEtlServicesByServiceName", [], ETL_SERVICES_PROJECTION());
  return graphql(payload, ACTION_TYPE.FETCH_ETL_SERVICES);
}

const EXECUTE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION = `
  mutation executeMsrUbrIndividualsImport($input: ExecuteMsrUbrIndividualsImportMutationInput!) {
    executeMsrUbrIndividualsImport(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

export function executeMsrUbrIndividualsImport(filters = {}) {
  const input = {};
  if (filters.location) {
    const { district, ta, village } = extractLocationCodes(filters.location);
    if (district) input.district = district;
    if (ta) input.ta = ta;
    if (village) input.village = village;
  }
  if (filters.classifications?.length) input.wealthQuintiles = filters.classifications.map((c) => c.value);
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  if (filters.householdHasLabour) input.hasLabour = filters.householdHasLabour;
  if (filters.femaleHeadedHousehold) input.householdHeadGender = filters.femaleHeadedHousehold;
  if (filters.exclusionPrograms?.length) input.excludedProgrammeCodes = filters.exclusionPrograms;
  input.lowerPercentileCategory = filters.lowerPercentileCategory ?? 0;
  input.upperPercentileCategory = filters.upperPercentileCategory ?? 100;
  return graphqlMutation(
    EXECUTE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION,
    { input },
    ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT,
  );
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
  dispatch({ type: CLEAR(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT) });
};

export const clearMsrUbrLocations = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_UBR_LOCATIONS) });
};

export const clearScheduleUbrLocationInitialPull = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL) });
};
