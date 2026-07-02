// Disable due to core architecture
/* eslint-disable camelcase */
import {
  graphql,
  graphqlMutation,
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

const EXECUTE_ETL_SERVICE_MUTATION = `
  mutation executeMsrEtlService($input: MsrEtlServiceMutationInput!) {
    executeMsrEtlService(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

export function executeMsrEtlService(serviceName, filters = {}) {
  const input = { nameOfService: serviceName };
  if (filters.location?.district) input.district = filters.location.district;
  if (filters.location?.ta) input.ta = filters.location.ta;
  if (filters.location?.village) input.village = filters.location.village;
  if (filters.classifications?.length) input.classification = filters.classifications.map((c) => c.value);
  if (filters.percentile != null) {
    input.lowerPercentileCategory = 0;
    input.upperPercentileCategory = filters.percentile;
  }
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  return graphqlMutation(EXECUTE_ETL_SERVICE_MUTATION, { input }, ACTION_TYPE.EXECUTE_ETL_SERVICE);
}

// ---------------------
// Clear actions
// ---------------------

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearMsrEtlExecution = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.EXECUTE_ETL_SERVICE) });
};
