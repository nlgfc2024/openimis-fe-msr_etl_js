export const MSR_ETL_MODULE_NAME = 'msrEtl';

// Rights
export const RIGHT_MSR_ETL_SEARCH = 190001;
export const RIGHT_MSR_ETL_CREATE = 190002;
export const RIGHT_MSR_ETL_UPDATE = 190003;
export const RIGHT_MSR_ETL_DELETE = 190004;
export const RIGHT_MSR_ETL_EXECUTE = 190005;

// Data types that can be pulled from the MSR server
export const MSR_DATA_TYPE = {
  LOCATIONS: 'LOCATIONS',
  HOUSEHOLDS: 'HOUSEHOLDS',
};

export const MSR_DATA_TYPE_LIST = [
  MSR_DATA_TYPE.LOCATIONS,
  MSR_DATA_TYPE.HOUSEHOLDS,
];

// Pull status
export const PULL_STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

// Auth types supported by the MSR server
export const MSR_AUTH_TYPE = {
  BASIC: 'BASIC',
  TOKEN: 'TOKEN',
};

export const MSR_AUTH_TYPE_LIST = [
  MSR_AUTH_TYPE.BASIC,
  MSR_AUTH_TYPE.TOKEN,
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_DEBOUNCE_TIME = 500;

// Contribution keys
export const MSR_ETL_CONFIG_TABS_LABEL_CONTRIBUTION_KEY = 'msrEtl.TabPanel.label';
export const MSR_ETL_CONFIG_TABS_PANEL_CONTRIBUTION_KEY = 'msrEtl.TabPanel.panel';

// ETL service class names (must match the Python class names on the backend)
export const UBR_INDIVIDUAL_SERVICE = 'UBRIndividualService';
export const UBR_LOCATION_SERVICE = 'UBRLocationService';
export const EXAMPLE_INDIVIDUAL_ETL_SERVICE = 'ExampleIndividualETLService';

// Services that use household filters
export const HOUSEHOLD_SERVICES = [
  UBR_INDIVIDUAL_SERVICE,
  EXAMPLE_INDIVIDUAL_ETL_SERVICE,
];

// LocalStorage key prefix for saved ETL filters
export const ETL_FILTERS_LS_KEY = (serviceName) => `msr-etl-filters-${serviceName}`;
