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

  // Execute UBR individuals import
  EXECUTE_UBR_INDIVIDUALS_IMPORT: 'MSR_ETL_EXECUTE_UBR_INDIVIDUALS_IMPORT',
};

const INITIAL_STATE = {
  // ETL services list
  fetchingMsrEtlServices: false,
  fetchedEtlServices: false,
  etlServices: [],
  errorEtlServices: null,

  // Execute UBR individuals import
  executingUbrIndividualsImport: false,
  errorUbrIndividualsImport: null,
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
    // Execute UBR individuals import
    // -------------------------
    case REQUEST(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        executingUbrIndividualsImport: true,
        errorUbrIndividualsImport: null,
      };

    case SUCCESS(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        executingUbrIndividualsImport: false,
        errorUbrIndividualsImport: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        executingUbrIndividualsImport: false,
        errorUbrIndividualsImport: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT):
      return {
        ...state,
        executingUbrIndividualsImport: false,
        errorUbrIndividualsImport: null,
      };

    default:
      return state;
  }
}

export default reducer;
