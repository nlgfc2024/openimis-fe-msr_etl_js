// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  formatServerError,
  formatGraphQLError,
} from '@openimis/fe-core';
import {
  REQUEST, SUCCESS, ERROR, CLEAR,
} from './util/action-type';

export const ACTION_TYPE = {
  // ETL services list
  FETCH_ETL_SERVICES: 'MSR_ETL_FETCH_ETL_SERVICES',

  // Execute ETL service
  EXECUTE_ETL_SERVICE: 'MSR_ETL_EXECUTE_ETL_SERVICE',
};

const INITIAL_STATE = {
  // ETL services list
  fetchingMsrEtlServices: false,
  fetchedEtlServices: false,
  etlServices: [],
  errorEtlServices: null,

  // Execute ETL service
  executingMsrEtlService: false,
  errorMsrEtlExecution: null,
};

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

    default:
      return state;
  }
}

export default reducer;
