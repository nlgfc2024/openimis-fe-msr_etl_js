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

export function fetchMsrUbrIndividuals(filters = {}) {
  const projection = [
    'count',
    'district',
    'ta',
    'village',
    'individuals',
  ];
  const params = {};
  if (data.location?.district) params.district = data.location.district;
  if (data.location?.ta) params.ta = data.location.ta;
  if (data.location?.village) params.village = data.location.village;
  if (data.classification) params.classification = data.classification;
  if (data.percentile) params.percentile = data.percentile;
  if (data.minAge) params.minAge = data.minAge;
  if (data.maxAge) params.maxAge = data.maxAge;
  if (data.gender) params.gender = data.gender;
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
