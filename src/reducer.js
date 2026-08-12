// Disabled due to consistency with other modules
/* eslint-disable default-param-last */
import { formatServerError, formatGraphQLError } from "@openimis/fe-core";
import { REQUEST, SUCCESS, ERROR, CLEAR } from "./util/action-type";

export const ACTION_TYPE = {
  // ETL services list
  FETCH_ETL_SERVICES: "MSR_ETL_FETCH_ETL_SERVICES",

  // Schedule UBR individuals import (background job)
  SCHEDULE_UBR_INDIVIDUALS_IMPORT: "MSR_ETL_SCHEDULE_UBR_INDIVIDUALS_IMPORT",

  // Fetch UBR locations
  FETCH_UBR_LOCATIONS: "MSR_ETL_FETCH_UBR_LOCATIONS",

  // Schedule full UBR location import (background job)
  SCHEDULE_UBR_LOCATIONS_IMPORT: "MSR_ETL_SCHEDULE_UBR_LOCATIONS_IMPORT",

  // Duplicate-submission guard: is a job of this type already active?
  FETCH_ACTIVE_MSR_ETL_JOB: "MSR_ETL_FETCH_ACTIVE_MSR_ETL_JOB",
};

const JOB_TYPE_TO_CLIENT_MUTATION_ID_FIELD = {
  ubr_individuals_import: "scheduledUbrIndividualsImportClientMutationId",
  ubr_locations_import: "scheduledUbrLocationsImportClientMutationId",
};

/**
 * Initial Redux state
 * @type {object}
 * @property {boolean} fetchingMsrUbrLocations - Loading indicator for location fetch
 * @property {string|null} errorMsrUbrLocations - Error message from location fetch
 */
const INITIAL_STATE = {
  // ETL services list
  fetchingMsrEtlServices: false,
  fetchedEtlServices: false,
  etlServices: [],
  errorEtlServices: null,

  // clientMutationId is set on dispatch, before the response returns
  schedulingUbrIndividualsImport: false,
  errorScheduleUbrIndividualsImport: null,
  scheduledUbrIndividualsImportClientMutationId: null,

  // UBR locations fetch result
  fetchingMsrUbrLocations: false,
  ubrLocationBatches: [],
  errorMsrUbrLocations: null,

  // Schedule UBR locations import
  schedulingUbrLocationsImport: false,
  errorScheduleUbrLocationsImport: null,
  scheduledUbrLocationsImportClientMutationId: null,
};

function mergeLocationBatches(previousBatches = [], incomingBatches = []) {
  const byType = new Map();

  previousBatches.forEach((batch) => {
    if (batch?.dataType) {
      byType.set(batch.dataType, batch);
    }
  });

  incomingBatches.forEach((batch) => {
    if (batch?.dataType) {
      byType.set(batch.dataType, batch);
    }
  });

  return Array.from(byType.values());
}

/**
 * MSR ETL reducer handles all state changes for location and individual data fetching.
 * @param {object} state - Current Redux state
 * @param {object} action - Redux action with type and payload
 * @returns {object} Updated state
 */
function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // -------------------------
    // ETL services list
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingMsrEtlServices: true,
        fetchedEtlServices: false,
        etlServices: [],
        errorEtlServices: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingMsrEtlServices: false,
        fetchedEtlServices: true,
        etlServices: action.payload.data?.msrEtlServicesByServiceName?.etlServices ?? [],
        errorEtlServices: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingMsrEtlServices: false,
        errorEtlServices: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingMsrEtlServices: false,
        fetchedEtlServices: false,
        etlServices: [],
        errorEtlServices: null,
      };

    // -------------------------
    // Schedule UBR individuals import
    // -------------------------
    case REQUEST(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        schedulingUbrIndividualsImport: true,
        errorScheduleUbrIndividualsImport: null,
        scheduledUbrIndividualsImportClientMutationId: action.meta?.clientMutationId ?? null,
      };

    case SUCCESS(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        schedulingUbrIndividualsImport: false,
        errorScheduleUbrIndividualsImport: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        schedulingUbrIndividualsImport: false,
        errorScheduleUbrIndividualsImport: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        schedulingUbrIndividualsImport: false,
        errorScheduleUbrIndividualsImport: null,
        scheduledUbrIndividualsImportClientMutationId: null,
      };

    // -------------------------
    // UBR locations
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_UBR_LOCATIONS):
      return {
        ...state,
        fetchingMsrUbrLocations: true,
        errorMsrUbrLocations: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_UBR_LOCATIONS):
      return {
        ...state,
        fetchingMsrUbrLocations: false,
        ubrLocationBatches: mergeLocationBatches(
          state.ubrLocationBatches,
          action.payload.data?.msrUbrLocations?.batches ?? [],
        ),
        errorMsrUbrLocations: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_UBR_LOCATIONS):
      return {
        ...state,
        fetchingMsrUbrLocations: false,
        ubrLocationBatches: [],
        errorMsrUbrLocations: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.FETCH_UBR_LOCATIONS):
      return {
        ...state,
        fetchingMsrUbrLocations: false,
        ubrLocationBatches: [],
        errorMsrUbrLocations: null,
      };

    // -------------------------
    // Schedule UBR locations import
    // -------------------------
    case REQUEST(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT):
      return {
        ...state,
        schedulingUbrLocationsImport: true,
        errorScheduleUbrLocationsImport: null,
        scheduledUbrLocationsImportClientMutationId: action.meta?.clientMutationId ?? null,
      };

    case SUCCESS(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT):
      return {
        ...state,
        schedulingUbrLocationsImport: false,
        errorScheduleUbrLocationsImport: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT):
      return {
        ...state,
        schedulingUbrLocationsImport: false,
        errorScheduleUbrLocationsImport: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT):
      return {
        ...state,
        schedulingUbrLocationsImport: false,
        errorScheduleUbrLocationsImport: null,
        scheduledUbrLocationsImportClientMutationId: null,
      };

    // -------------------------
    // Active job check (duplicate-submission guard)
    // -------------------------
    case SUCCESS(ACTION_TYPE.FETCH_ACTIVE_MSR_ETL_JOB): {
      const field = JOB_TYPE_TO_CLIENT_MUTATION_ID_FIELD[action.meta?.jobType];
      const activeJob = action.payload.data?.asyncJobs?.edges?.[0]?.node;
      if (!field || !activeJob?.clientMutationId) return state;
      // never overwrite a job already tracked from this page (e.g. just scheduled)
      return { ...state, [field]: state[field] || activeJob.clientMutationId };
    }

    default:
      return state;
  }
}

export default reducer;
