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

  // Fetch UBR individuals
  FETCH_UBR_INDIVIDUALS: 'MSR_ETL_FETCH_UBR_INDIVIDUALS',
};

const INITIAL_STATE = {
  // ETL services list
  fetchingMsrEtlServices: false,
  fetchedEtlServices: false,
  etlServices: [],
  errorEtlServices: null,

  // UBR individuals fetch result
  fetchingMsrUbrIndividuals: false,
  fetchedMsrUbrIndividuals: false,
  msrUbrIndividualsResult: null,
  errorMsrUbrIndividuals: null,
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
    // UBR individuals
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_UBR_INDIVIDUALS):
      return {
        ...state,
        fetchingMsrUbrIndividuals: true,
        fetchedMsrUbrIndividuals: false,
        msrUbrIndividualsResult: null,
        errorMsrUbrIndividuals: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_UBR_INDIVIDUALS):
      return {
        ...state,
        fetchingMsrUbrIndividuals: false,
        fetchedMsrUbrIndividuals: true,
        msrUbrIndividualsResult: action.payload.data?.msrUbrIndividuals ?? null,
        errorMsrUbrIndividuals: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_UBR_INDIVIDUALS):
      return {
        ...state,
        fetchingMsrUbrIndividuals: false,
        errorMsrUbrIndividuals: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.FETCH_UBR_INDIVIDUALS):
      return {
        ...state,
        fetchingMsrUbrIndividuals: false,
        fetchedMsrUbrIndividuals: false,
        msrUbrIndividualsResult: null,
        errorMsrUbrIndividuals: null,
      };

    default:
      return state;
  }
}

export default reducer;
