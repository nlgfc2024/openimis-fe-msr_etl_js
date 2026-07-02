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
// Helpers
// ---------------------

function extractLocationCodes(location) {
  const codes = {};
  let current = location;
  while (current) {
    if (current.type === 'D') codes.district = current.code;
    else if (current.type === 'W') codes.ta = current.code;
    else if (current.type === 'V') codes.village = current.code;
    current = current.parent ?? null;
  }
  return codes;
}

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

const EXECUTE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION = `
  mutation executeMsrUbrIndividualsImport($input: ExecuteMsrUbrIndividualsImportMutationInput!) {
    executeMsrUbrIndividualsImport(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

export function executeMsrUbrIndividualsImport(filters = {}) {
  const input = {};
  if (filters.location) {
    const { district, ta, village } = extractLocationCodes(filters.location);
    if (district) input.district = district;
    if (ta) input.ta = ta;
    if (village) input.village = village;
  }
  if (filters.classifications?.length) input.wealthQuintiles = filters.classifications.map((c) => c.value);
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  if (filters.householdHasLabour) input.hasLabour = filters.householdHasLabour;
  if (filters.femaleHeadedHousehold) input.householdHeadGender = filters.femaleHeadedHousehold;
  if (filters.exclusionPrograms?.length) input.excludedProgrammeCodes = filters.exclusionPrograms;
  input.lowerPercentileCategory = filters.lowerPercentileCategory ?? 0;
  input.upperPercentileCategory = filters.upperPercentileCategory ?? 100;
  return graphqlMutation(
    EXECUTE_MSR_UBR_INDIVIDUALS_IMPORT_MUTATION,
    { input },
    ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT,
  );
}

// ---------------------
// Clear actions
// ---------------------

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearMsrEtlExecution = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.EXECUTE_UBR_INDIVIDUALS_IMPORT) });
};
