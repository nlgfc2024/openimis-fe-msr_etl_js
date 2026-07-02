// Disabled due to consistency with other modules
/* eslint-disable default-param-last */
import { formatServerError, formatGraphQLError } from "@openimis/fe-core";
import { REQUEST, SUCCESS, ERROR, CLEAR } from "./util/action-type";

export const ACTION_TYPE = {
  // ETL services list
  FETCH_ETL_SERVICES: "MSR_ETL_FETCH_ETL_SERVICES",

  // Execute ETL service
  EXECUTE_ETL_SERVICE: "MSR_ETL_EXECUTE_ETL_SERVICE",

  // Fetch UBR locations
  FETCH_UBR_LOCATIONS: "MSR_ETL_FETCH_UBR_LOCATIONS",

  // Schedule full UBR location initial pull
  SCHEDULE_UBR_LOCATION_INITIAL_PULL: "MSR_ETL_SCHEDULE_UBR_LOCATION_INITIAL_PULL",

  // Fetch status of location initial pull request
  FETCH_UBR_LOCATION_INITIAL_PULL_STATUS: "MSR_ETL_FETCH_UBR_LOCATION_INITIAL_PULL_STATUS",
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

  // Execute ETL service
  executingMsrEtlService: false,
  errorMsrEtlExecution: null,

  // UBR locations fetch result
  fetchingMsrUbrLocations: false,
  ubrLocationBatches: [],
  errorMsrUbrLocations: null,

  // Schedule UBR location initial pull
  schedulingUbrLocationInitialPull: false,
  errorScheduleUbrLocationInitialPull: null,
  locationInitialPullRequestId: null,
  locationInitialPullStatus: null,
  fetchingLocationInitialPullStatus: false,
  errorLocationInitialPullStatus: null,
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
    // Execute ETL service
    // -------------------------
    case REQUEST(ACTION_TYPE.EXECUTE_ETL_SERVICE):
      return {
        ...state,
        executingMsrEtlService: true,
        errorMsrEtlExecution: null,
      };

    case SUCCESS(ACTION_TYPE.EXECUTE_ETL_SERVICE):
      return {
        ...state,
        executingMsrEtlService: false,
        errorMsrEtlExecution: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.EXECUTE_ETL_SERVICE):
      return {
        ...state,
        executingMsrEtlService: false,
        errorMsrEtlExecution: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.EXECUTE_ETL_SERVICE):
      return {
        ...state,
        executingMsrEtlService: false,
        errorMsrEtlExecution: null,
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
    // Schedule location initial pull
    // -------------------------
    case REQUEST(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL):
      return {
        ...state,
        schedulingUbrLocationInitialPull: true,
        errorScheduleUbrLocationInitialPull: null,
      };

    case SUCCESS(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL):
      {
        const scheduleResponse = action.payload.data?.executeMsrEtlService;
        const requestId = scheduleResponse?.internalId || null;
        const graphQLError = formatGraphQLError(action.payload);
        const isScheduled = !graphQLError && !!scheduleResponse;
      return {
        ...state,
        schedulingUbrLocationInitialPull: false,
        locationInitialPullRequestId: isScheduled && requestId ? requestId : null,
        locationInitialPullStatus: isScheduled
          ? requestId
            ? {
                requestId,
                status: "SUBMITTED",
                message: "Location import request submitted",
              }
            : {
                requestId: null,
                status: "COMPLETED",
                message: "Location import request submitted",
              }
          : null,
        errorScheduleUbrLocationInitialPull: graphQLError,
      };
      }

    case ERROR(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL):
      return {
        ...state,
        schedulingUbrLocationInitialPull: false,
        locationInitialPullRequestId: null,
        errorScheduleUbrLocationInitialPull: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.SCHEDULE_UBR_LOCATION_INITIAL_PULL):
      return {
        ...state,
        schedulingUbrLocationInitialPull: false,
        errorScheduleUbrLocationInitialPull: null,
        locationInitialPullRequestId: null,
        locationInitialPullStatus: null,
      };

    // -------------------------
    // Fetch location initial pull status
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_UBR_LOCATION_INITIAL_PULL_STATUS):
      return {
        ...state,
        fetchingLocationInitialPullStatus: true,
        errorLocationInitialPullStatus: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_UBR_LOCATION_INITIAL_PULL_STATUS):
      {
        const statusPayload = action.payload.data?.msrUbrLocationInitialPullStatus;
        return {
          ...state,
          fetchingLocationInitialPullStatus: false,
          locationInitialPullStatus: statusPayload
            ? {
                requestId: statusPayload.requestId,
                status: statusPayload.status,
                message: statusPayload.message,
                startedAt: statusPayload.startedAt,
                finishedAt: statusPayload.finishedAt,
                updatedAt: statusPayload.updatedAt,
              }
            : state.locationInitialPullStatus,
          errorLocationInitialPullStatus: formatGraphQLError(action.payload),
        };
      }

    case ERROR(ACTION_TYPE.FETCH_UBR_LOCATION_INITIAL_PULL_STATUS):
      return {
        ...state,
        fetchingLocationInitialPullStatus: false,
        errorLocationInitialPullStatus: formatServerError(action.payload),
      };

    default:
      return state;
  }
}

export default reducer;
