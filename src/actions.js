// Disable due to core architecture
/* eslint-disable camelcase */
import {
  graphql,
  formatQuery,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
  graphqlWithVariables,
  decodeId,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './util/action-type';

// ---------------------
// Field projections
// ---------------------

const ETL_SERVICES_PROJECTION = () => [
  'etlServices { nameOfService }',
];

const MSR_ETL_CONFIG_FULL_PROJECTION = () => [
  'id',
  'name',
  'serverUrl',
  'authType',
  'username',
  'dataTypes',
  'isActive',
  'jsonExt',
  'dateCreated',
  'dateUpdated',
  'userCreated { username }',
  'userUpdated { username }',
];

const MSR_ETL_PULL_HISTORY_FULL_PROJECTION = () => [
  'id',
  'config { id name }',
  'dataType',
  'status',
  'triggeredBy { username }',
  'dateTriggered',
  'dateCompleted',
  'recordsFetched',
  'recordsProcessed',
  'errorMessage',
];

// ---------------------
// Queries
// ---------------------

export function fetchEtlServices() {
  const payload = formatQuery(
    'etlServicesByServiceName',
    [],
    ETL_SERVICES_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.FETCH_ETL_SERVICES);
}

export function fetchMsrEtlConfigs(params) {
  const payload = formatPageQueryWithCount(
    'msrEtlConfig',
    params,
    MSR_ETL_CONFIG_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_CONFIGS);
}

export function fetchMsrEtlConfig(params) {
  const payload = formatPageQuery(
    'msrEtlConfig',
    params,
    MSR_ETL_CONFIG_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_CONFIG);
}

export function fetchMsrEtlPullHistory(params) {
  const payload = formatPageQueryWithCount(
    'msrEtlPullHistory',
    params,
    MSR_ETL_PULL_HISTORY_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.SEARCH_PULL_HISTORY);
}

// ---------------------
// GQL formatters
// ---------------------

function formatMsrEtlConfigGQL(config) {
  return `
    ${config?.id ? `id: "${config.id}"` : ''}
    ${config?.name ? `name: "${formatGQLString(config.name)}"` : ''}
    ${config?.serverUrl ? `serverUrl: "${formatGQLString(config.serverUrl)}"` : ''}
    ${config?.authType ? `authType: ${config.authType}` : ''}
    ${config?.username ? `username: "${formatGQLString(config.username)}"` : ''}
    ${config?.password ? `password: "${formatGQLString(config.password)}"` : ''}
    ${config?.token ? `token: "${formatGQLString(config.token)}"` : ''}
    ${config?.dataTypes ? `dataTypes: ${JSON.stringify(config.dataTypes)}` : ''}
    ${config?.isActive !== undefined ? `isActive: ${config.isActive}` : ''}
    ${config?.jsonExt ? `jsonExt: ${JSON.stringify(config.jsonExt)}` : ''}
  `;
}

// ---------------------
// Mutations
// ---------------------

export function createMsrEtlConfig(config, clientMutationLabel) {
  const mutation = formatMutation(
    'createMsrEtlConfig',
    formatMsrEtlConfigGQL(config),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_CONFIG), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_CONFIG,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateMsrEtlConfig(config, clientMutationLabel) {
  const mutation = formatMutation(
    'updateMsrEtlConfig',
    formatMsrEtlConfigGQL(config),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_CONFIG), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_CONFIG,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteMsrEtlConfig(config, clientMutationLabel) {
  const configId = `ids: ["${config?.id}"]`;
  const mutation = formatMutation('deleteMsrEtlConfig', configId, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_CONFIG), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_CONFIG,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function triggerMsrEtlPull(configId, dataType, clientMutationLabel) {
  const mutationInput = `
    configId: "${configId}"
    ${dataType ? `dataType: ${dataType}` : ''}
  `;
  const mutation = formatMutation('triggerMsrEtlPull', mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRIGGER_PULL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.TRIGGER_PULL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function triggerMsrEtlPullAll(configId, clientMutationLabel) {
  const mutationInput = `configId: "${configId}"`;
  const mutation = formatMutation('triggerMsrEtlPullAll', mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.TRIGGER_PULL_ALL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.TRIGGER_PULL_ALL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

// ---------------------
// Clear actions
// ---------------------

export const clearEtlServices = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES) });
};

export const clearMsrEtlConfig = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.GET_CONFIG) });
};

export const clearMsrEtlConfigs = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SEARCH_CONFIGS) });
};

export const clearMsrEtlPullHistory = () => (dispatch) => {
  dispatch({ type: CLEAR(ACTION_TYPE.SEARCH_PULL_HISTORY) });
};
