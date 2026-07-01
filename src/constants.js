export const MSR_ETL_MODULE_NAME = 'msrEtl';

// Rights
export const RIGHT_MSR_ETL_SEARCH = 953001;
export const RIGHT_MSR_ETL_EXPORT = 953002;

// Household filter options
export const DEFAULT_CLASSIFICATIONS = [
  { value: 'poorest', label: 'Poorest' },
  { value: 'poorer', label: 'Poorer' },
  { value: 'poor', label: 'Poor' },
  { value: 'better', label: 'Better' },
  { value: 'rich', label: 'Rich' },
];

export const DEFAULT_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const EXCLUSION_PROGRAM_OPTIONS = [
  { value: '1', label: 'Social Cash Transfer' },
  { value: '2', label: 'Public Works Programme' },
  { value: '3', label: 'VSL/COMSIP' },
  { value: '4', label: 'Microfinance' },
];

// ETL service class names (must match the Python class names on the backend)
export const MSR_ETL_SERVICES = {
  UBR_INDIVIDUAL_SERVICE: 'UBRIndividualService',
  UBR_LOCATION_SERVICE: 'UBRLocationService',
  EXAMPLE_INDIVIDUAL_ETL_SERVICE: 'ExampleIndividualETLService',
};
