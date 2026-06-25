export const MSR_ETL_MODULE_NAME = 'msrEtl';

// Rights
export const RIGHT_MSR_ETL_SEARCH = 190001;

// ETL service class names (must match the Python class names on the backend)
export const UBR_INDIVIDUAL_SERVICE = 'UBRIndividualService';
export const UBR_LOCATION_SERVICE = 'UBRLocationService';
export const EXAMPLE_INDIVIDUAL_ETL_SERVICE = 'ExampleIndividualETLService';

// Services that use household filters
export const HOUSEHOLD_SERVICES = [
  UBR_INDIVIDUAL_SERVICE,
  EXAMPLE_INDIVIDUAL_ETL_SERVICE,
];
