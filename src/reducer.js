// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  parseData,
  pageInfo,
  decodeId,
} from '@openimis/fe-core';
import {
  REQUEST, SUCCESS, ERROR, CLEAR,
} from './util/action-type';

export const ACTION_TYPE = {
  MUTATION: 'MSR_ETL_MUTATION',

  // ETL services list
  FETCH_ETL_SERVICES: 'MSR_ETL_FETCH_ETL_SERVICES',

  // Config CRUD
  SEARCH_CONFIGS: 'MSR_ETL_SEARCH_CONFIGS',
  GET_CONFIG: 'MSR_ETL_GET_CONFIG',
  CREATE_CONFIG: 'MSR_ETL_CREATE_CONFIG',
  UPDATE_CONFIG: 'MSR_ETL_UPDATE_CONFIG',
  DELETE_CONFIG: 'MSR_ETL_DELETE_CONFIG',

  // ETL pull operations
  TRIGGER_PULL: 'MSR_ETL_TRIGGER_PULL',
  TRIGGER_PULL_ALL: 'MSR_ETL_TRIGGER_PULL_ALL',

  // Pull history
  SEARCH_PULL_HISTORY: 'MSR_ETL_SEARCH_PULL_HISTORY',
};

const INITIAL_STATE = {
  // Mutation state
  submittingMutation: false,
  mutation: {},

  // ETL services list
  fetchingEtlServices: false,
  fetchedEtlServices: false,
  etlServices: [],
  errorEtlServices: null,

  // Config list
  fetchingConfigs: false,
  fetchedConfigs: false,
  configs: [],
  configsPageInfo: {},
  configsTotalCount: 0,
  errorConfigs: null,

  // Single config
  fetchingConfig: false,
  fetchedConfig: false,
  config: null,
  errorConfig: null,

  // Pull history
  fetchingPullHistory: false,
  fetchedPullHistory: false,
  pullHistory: [],
  pullHistoryPageInfo: {},
  pullHistoryTotalCount: 0,
  errorPullHistory: null,
};

function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // -------------------------
    // ETL services list
    // -------------------------
    case REQUEST(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingEtlServices: true,
        fetchedEtlServices: false,
        etlServices: [],
        errorEtlServices: null,
      };

    case SUCCESS(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingEtlServices: false,
        fetchedEtlServices: true,
        etlServices: action.payload.data?.etlServicesByServiceName?.etlServices ?? [],
        errorEtlServices: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingEtlServices: false,
        errorEtlServices: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.FETCH_ETL_SERVICES):
      return {
        ...state,
        fetchingEtlServices: false,
        fetchedEtlServices: false,
        etlServices: [],
        errorEtlServices: null,
      };

    // -------------------------
    // Config list - REQUEST
    // -------------------------
    case REQUEST(ACTION_TYPE.SEARCH_CONFIGS):
      return {
        ...state,
        fetchingConfigs: true,
        fetchedConfigs: false,
        configs: [],
        configsPageInfo: {},
        configsTotalCount: 0,
        errorConfigs: null,
      };

    case SUCCESS(ACTION_TYPE.SEARCH_CONFIGS):
      return {
        ...state,
        fetchingConfigs: false,
        fetchedConfigs: true,
        configs: parseData(action.payload.data.msrEtlConfig)?.map((cfg) => ({
          ...cfg,
          id: decodeId(cfg.id),
        })) ?? [],
        configsPageInfo: pageInfo(action.payload.data.msrEtlConfig),
        configsTotalCount: action.payload.data.msrEtlConfig
          ? action.payload.data.msrEtlConfig.totalCount
          : 0,
        errorConfigs: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.SEARCH_CONFIGS):
      return {
        ...state,
        fetchingConfigs: false,
        errorConfigs: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.SEARCH_CONFIGS):
      return {
        ...state,
        fetchingConfigs: false,
        fetchedConfigs: false,
        configs: [],
        configsPageInfo: {},
        configsTotalCount: 0,
        errorConfigs: null,
      };

    // -------------------------
    // Single config - REQUEST
    // -------------------------
    case REQUEST(ACTION_TYPE.GET_CONFIG):
      return {
        ...state,
        fetchingConfig: true,
        fetchedConfig: false,
        config: null,
        errorConfig: null,
      };

    case SUCCESS(ACTION_TYPE.GET_CONFIG):
      return {
        ...state,
        fetchingConfig: false,
        fetchedConfig: true,
        config: parseData(action.payload.data.msrEtlConfig)?.map((cfg) => ({
          ...cfg,
          id: decodeId(cfg.id),
        }))?.[0] ?? null,
        errorConfig: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.GET_CONFIG):
      return {
        ...state,
        fetchingConfig: false,
        errorConfig: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.GET_CONFIG):
      return {
        ...state,
        fetchingConfig: false,
        fetchedConfig: false,
        config: null,
        errorConfig: null,
      };

    // -------------------------
    // Pull history
    // -------------------------
    case REQUEST(ACTION_TYPE.SEARCH_PULL_HISTORY):
      return {
        ...state,
        fetchingPullHistory: true,
        fetchedPullHistory: false,
        pullHistory: [],
        pullHistoryPageInfo: {},
        pullHistoryTotalCount: 0,
        errorPullHistory: null,
      };

    case SUCCESS(ACTION_TYPE.SEARCH_PULL_HISTORY):
      return {
        ...state,
        fetchingPullHistory: false,
        fetchedPullHistory: true,
        pullHistory: parseData(action.payload.data.msrEtlPullHistory)?.map((item) => ({
          ...item,
          id: decodeId(item.id),
        })) ?? [],
        pullHistoryPageInfo: pageInfo(action.payload.data.msrEtlPullHistory),
        pullHistoryTotalCount: action.payload.data.msrEtlPullHistory
          ? action.payload.data.msrEtlPullHistory.totalCount
          : 0,
        errorPullHistory: formatGraphQLError(action.payload),
      };

    case ERROR(ACTION_TYPE.SEARCH_PULL_HISTORY):
      return {
        ...state,
        fetchingPullHistory: false,
        errorPullHistory: formatServerError(action.payload),
      };

    case CLEAR(ACTION_TYPE.SEARCH_PULL_HISTORY):
      return {
        ...state,
        fetchingPullHistory: false,
        fetchedPullHistory: false,
        pullHistory: [],
        pullHistoryPageInfo: {},
        pullHistoryTotalCount: 0,
        errorPullHistory: null,
      };

    // -------------------------
    // Mutations
    // -------------------------
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);

    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);

    case SUCCESS(ACTION_TYPE.CREATE_CONFIG):
      return dispatchMutationResp(state, 'createMsrEtlConfig', action);

    case SUCCESS(ACTION_TYPE.UPDATE_CONFIG):
      return dispatchMutationResp(state, 'updateMsrEtlConfig', action);

    case SUCCESS(ACTION_TYPE.DELETE_CONFIG):
      return dispatchMutationResp(state, 'deleteMsrEtlConfig', action);

    case SUCCESS(ACTION_TYPE.TRIGGER_PULL):
      return dispatchMutationResp(state, 'triggerMsrEtlPull', action);

    case SUCCESS(ACTION_TYPE.TRIGGER_PULL_ALL):
      return dispatchMutationResp(state, 'triggerMsrEtlPullAll', action);

    default:
      return state;
  }
}

export default reducer;
