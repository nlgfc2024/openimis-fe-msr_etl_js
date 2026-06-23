// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import flatten from 'flat';
import { FormattedMessage } from '@openimis/fe-core';
import React from 'react';
import SyncAltIcon from '@material-ui/icons/SyncAlt';

import messages_en from './translations/en.json';
import reducer from './reducer';
import MsrEtlConfigsPage from './pages/MsrEtlConfigsPage';
import MsrEtlFiltersPage from './pages/MsrEtlFiltersPage';
import LocationFilter from './components/LocationFilter';
import {
  MSR_ETL_MODULE_NAME,
  RIGHT_MSR_ETL_SEARCH,
} from './constants';

const ROUTE_MSR_ETL_CONFIGS = 'msr-etl';
const ROUTE_MSR_ETL_FILTERS = 'msr-etl/filters';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: 'msrEtl', reducer }],
  'core.Router': [
    { path: ROUTE_MSR_ETL_CONFIGS, component: MsrEtlConfigsPage },
    { path: `${ROUTE_MSR_ETL_FILTERS}/:service_name`, component: MsrEtlFiltersPage },
  ],
  'socialProtection.MainMenu': [
    {
      text: <FormattedMessage module={MSR_ETL_MODULE_NAME} id="menu.importDataFilters" />,
      icon: <SyncAltIcon />,
      route: `/${ROUTE_MSR_ETL_CONFIGS}`,
      filter: (rights) => rights.includes(RIGHT_MSR_ETL_SEARCH),
      id: 'msrEtl.configs',
    },
  ],
  refs: [
    { key: 'msrEtl.route.configs', ref: ROUTE_MSR_ETL_CONFIGS },
    { key: 'msrEtl.route.filters', ref: ROUTE_MSR_ETL_FILTERS },
    { key: 'msrEtl.LocationFilter', ref: LocationFilter },
  ],
};

export const MsrEtlModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
