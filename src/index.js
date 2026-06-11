import React from 'react';
import flatten from 'flat';
import messages_en from './translations/en.json';
import reducer from './reducer';
import { MODULE_NAME, ROUTE_MSR_ETL_CONFIGS } from './constants';
import HouseholdPullFilterDialog from './components/HouseholdPullFilterDialog';

const DEFAULT_CONFIG = {
  id: MODULE_NAME,
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: MODULE_NAME, reducer }], 
  refs: [
    { key: 'msrEtl.dialog.householdPullFilters', ref: HouseholdPullFilterDialog },
  ],
};

export const MsrEtlModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
