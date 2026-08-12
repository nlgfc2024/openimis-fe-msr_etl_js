// Disable due to core architecture
/* eslint-disable camelcase */
import { graphql, graphqlWithVariables, formatQuery } from "@openimis/fe-core";
import { ACTION_TYPE } from "./reducer";
import { CLEAR } from "./util/action-type";
import { getLocationFilterParams, getUbrHouseholdLocationParams } from "./util/location";

const ETL_SERVICES_PROJECTION = () => ["etlServices { nameOfService }"];

function buildFilters(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => (typeof value === "number" ? `${key}: ${value}` : `${key}: "${value}"`));
}

// crypto.randomUUID requires a secure context; fall back on plain HTTP
function generateClientMutationId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function fetchMsrEtlServices() {
  const payload = formatQuery("msrEtlServicesByServiceName", [], ETL_SERVICES_PROJECTION());
  return graphql(payload, ACTION_TYPE.FETCH_ETL_SERVICES);
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
  const input = getUbrHouseholdLocationParams(filters.location);
  if (filters.classifications?.length) input.wealthQuintiles = filters.classifications.map((c) => c.value);
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  if (filters.householdHasLabour) input.hasLabour = filters.householdHasLabour;
  if (filters.femaleHeadedHousehold) input.householdHeadGender = filters.femaleHeadedHousehold;
  if (filters.exclusionPrograms?.length) input.excludedProgrammeCodes = filters.exclusionPrograms;
  // unset defers to the backend's 0-10 default range
  if (filters.lowerPercentileCategory != null) input.lowerPercentileCategory = filters.lowerPercentileCategory;
  if (filters.upperPercentileCategory != null) input.upperPercentileCategory = filters.upperPercentileCategory;
  input.clientMutationId = clientMutationId;

  return graphqlWithVariables(
    SCHEDULE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION,
    { input },
    ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT,
    { clientMutationId },
  );
}

/**
 * Fetch UBR locations filtered by geographic location codes.
 * Normalizes location filters and queries location data from MSR ETL service.
 *
 * @param {object} filters - Filter object with optional location property
 * @param {object} filters.location - Location codes (district, ta, gvh, village)
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

const SCHEDULE_MSR_UBR_LOCATIONS_IMPORT_MUTATION = `
  mutation scheduleMsrUbrLocationsImport($input: ScheduleMsrUbrLocationsImportMutationInput!) {
    scheduleMsrUbrLocationsImport(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

export function scheduleMsrUbrLocationsImport() {
  const clientMutationId = generateClientMutationId();
  return graphqlWithVariables(
    SCHEDULE_MSR_UBR_LOCATIONS_IMPORT_MUTATION,
    { input: { clientMutationId } },
    ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT,
    { clientMutationId },
  );
}

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearScheduleUbrIndividualsImport = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT) });
};

export const clearMsrUbrLocations = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_UBR_LOCATIONS) });
};

export const clearScheduleUbrLocationsImport = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT) });
};
