// Disable due to core architecture
/* eslint-disable camelcase */
import {
  graphql,
  formatQuery,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import {
  CLEAR,
} from './util/action-type';

// ---------------------
// Field projections
// ---------------------

const ETL_SERVICES_PROJECTION = () => [
  'etlServices { nameOfService }',
];

// ---------------------
// Queries
// ---------------------

export function fetchMsrEtlServices() {
  const payload = formatQuery(
    'msrEtlServicesByServiceName',
    [],
    ETL_SERVICES_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.FETCH_ETL_SERVICES);
}

export function fetchMsrUbrIndividuals({ district, ta, village } = {}) {
  const projection = [
    'count',
    'district',
    'ta',
    'village',
    'individuals',
  ];
  const params = {};
  if (district) params.district = district;
  if (ta) params.ta = ta;
  if (village) params.village = village;
  const payload = formatQuery('msrUbrIndividuals', params, projection);
  return graphql(payload, ACTION_TYPE.FETCH_UBR_INDIVIDUALS);
}

// ---------------------
// Clear actions
// ---------------------

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearMsrUbrIndividuals = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_UBR_INDIVIDUALS) });
};
