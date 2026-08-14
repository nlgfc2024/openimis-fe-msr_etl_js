// Disabled due to consistency with other modules
/* eslint-disable default-param-last */
import { formatServerError, formatGraphQLError, parseData, pageInfo } from "@openimis/fe-core";
import { REQUEST, SUCCESS, ERROR, CLEAR } from "./util/action-type";
import { MSR_ETL_JOB_TYPE } from "./constants";

export const ACTION_TYPE = {
  // Schedule UBR individuals import (background job)
  SCHEDULE_UBR_INDIVIDUALS_IMPORT: "MSR_ETL_SCHEDULE_UBR_INDIVIDUALS_IMPORT",

  // Fetch UBR locations for the District/TA/GVH cascading dropdown options
  // and the sync log page's code-to-name lookup
  FETCH_UBR_LOCATION_OPTIONS: "MSR_ETL_FETCH_UBR_LOCATION_OPTIONS",

  // Schedule full UBR location import (background job)
  SCHEDULE_UBR_LOCATIONS_IMPORT: "MSR_ETL_SCHEDULE_UBR_LOCATIONS_IMPORT",

  // Duplicate-submission guard: is a job of this type already active?
  FETCH_ACTIVE_MSR_ETL_JOB: "MSR_ETL_FETCH_ACTIVE_MSR_ETL_JOB",

  // Per-unit staging/sync status for the sync-log page
  FETCH_MSR_ETL_SYNC_UNITS: "MSR_ETL_FETCH_MSR_ETL_SYNC_UNITS",

  // Recent jobs list for the Logs tab
  FETCH_RECENT_MSR_ETL_JOBS: "MSR_ETL_FETCH_RECENT_MSR_ETL_JOBS",
};

const JOB_TYPE_TO_CLIENT_MUTATION_ID_FIELD = {
  [MSR_ETL_JOB_TYPE.UBR_INDIVIDUALS_IMPORT]: "scheduledUbrIndividualsImportClientMutationId",
  [MSR_ETL_JOB_TYPE.UBR_LOCATIONS_IMPORT]: "scheduledUbrLocationsImportClientMutationId",
};

const INITIAL_STATE = {
  // clientMutationId is set on dispatch, before the response returns
  schedulingUbrIndividualsImport: false,
  errorScheduleUbrIndividualsImport: null,
  scheduledUbrIndividualsImportClientMutationId: null,

  // District/TA/GVH cascading dropdown options
  fetchingUbrLocationOptions: false,
  ubrLocationOptionBatches: [],
  errorUbrLocationOptions: null,

  // Schedule UBR locations import
  schedulingUbrLocationsImport: false,
  errorScheduleUbrLocationsImport: null,
  scheduledUbrLocationsImportClientMutationId: null,

  // Sync-log page
  fetchingMsrEtlSyncUnits: false,
  msrEtlSyncUnits: [],
  msrEtlSyncUnitsCount: 0,
  msrEtlSyncUnitsTotalCount: 0,
  errorMsrEtlSyncUnits: null,

  // Logs tab
  fetchingRecentMsrEtlJobs: false,
  fetchedRecentMsrEtlJobs: false,
  recentMsrEtlJobs: [],
  recentMsrEtlJobsPageInfo: {},
  recentMsrEtlJobsTotalCount: 0,
  errorRecentMsrEtlJobs: null,
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
    // UBR location dropdown options
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_UBR_LOCATION_OPTIONS):
      return {
        ...state,
        fetchingUbrLocationOptions: true,
        errorUbrLocationOptions: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_UBR_LOCATION_OPTIONS):
      return {
        ...state,
        fetchingUbrLocationOptions: false,
        ubrLocationOptionBatches: mergeLocationBatches(
          state.ubrLocationOptionBatches,
          action.payload.data?.msrUbrLocations?.batches ?? [],
        ),
        errorUbrLocationOptions: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_UBR_LOCATION_OPTIONS):
      return {
        ...state,
        fetchingUbrLocationOptions: false,
        errorUbrLocationOptions: formatServerError(action.payload),
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

    // -------------------------
    // Sync-log page
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS):
      return {
        ...state,
        fetchingMsrEtlSyncUnits: true,
        errorMsrEtlSyncUnits: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS): {
      const result = action.payload.data?.msrEtlSyncUnits;
      return {
        ...state,
        fetchingMsrEtlSyncUnits: false,
        msrEtlSyncUnits: result?.units ?? [],
        msrEtlSyncUnitsCount: result?.count ?? 0,
        msrEtlSyncUnitsTotalCount: result?.totalCount ?? 0,
        errorMsrEtlSyncUnits: formatGraphQLError(action.payload),
      };
    }

    case ERROR(ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS):
      return {
        ...state,
        fetchingMsrEtlSyncUnits: false,
        errorMsrEtlSyncUnits: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.FETCH_MSR_ETL_SYNC_UNITS):
      return {
        ...state,
        fetchingMsrEtlSyncUnits: false,
        msrEtlSyncUnits: [],
        msrEtlSyncUnitsCount: 0,
        msrEtlSyncUnitsTotalCount: 0,
        errorMsrEtlSyncUnits: null,
      };

    // -------------------------
    // Logs tab
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_RECENT_MSR_ETL_JOBS):
      return {
        ...state,
        fetchingRecentMsrEtlJobs: true,
        fetchedRecentMsrEtlJobs: false,
        errorRecentMsrEtlJobs: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_RECENT_MSR_ETL_JOBS):
      return {
        ...state,
        fetchingRecentMsrEtlJobs: false,
        fetchedRecentMsrEtlJobs: true,
        recentMsrEtlJobs: parseData(action.payload.data?.asyncJobs),
        recentMsrEtlJobsPageInfo: pageInfo(action.payload.data?.asyncJobs),
        recentMsrEtlJobsTotalCount: action.payload.data?.asyncJobs?.totalCount ?? 0,
        errorRecentMsrEtlJobs: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_RECENT_MSR_ETL_JOBS):
      return {
        ...state,
        fetchingRecentMsrEtlJobs: false,
        errorRecentMsrEtlJobs: formatServerError(action.payload),
      };

    default:
      return state;
  }
}

export default reducer;
