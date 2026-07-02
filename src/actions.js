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
  ];
  const params = {};
  if (filters.location?.district) params.district = filters.location.district;
  if (filters.location?.ta) params.ta = filters.location.ta;
  if (filters.location?.village) params.village = filters.location.village;
  if (filters.classification) params.classification = filters.classification;
  if (filters.percentile) params.percentile = filters.percentile;
  if (filters.minAge) params.minAge = filters.minAge;
  if (filters.maxAge) params.maxAge = filters.maxAge;
  if (filters.gender) params.gender = filters.gender;
  if (filters.householdHasLabour) params.householdHasLabour = filters.householdHasLabour;
  if (filters.femaleHeadedHousehold) params.femaleHeadedHousehold = filters.femaleHeadedHousehold;
  if (filters.exclusionPrograms?.length) params.exclusionPrograms = filters.exclusionPrograms;
  params.lowerPercentileCategory = filters.lowerPercentileCategory ?? 0;
  params.upperPercentileCategory = filters.upperPercentileCategory ?? 100;
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
