export const MSR_ETL_MODULE_NAME = "msrEtl";

// Rights
export const RIGHT_MSR_ETL_SEARCH = 953001;
export const RIGHT_MSR_ETL_EXPORT = 953002;

// Household filter options
export const DEFAULT_CLASSIFICATIONS = [
  { value: 1, label: "Poorest" },
  { value: 2, label: "Poorer" },
  { value: 3, label: "Poor" },
  { value: 4, label: "Better Off" },
  { value: 5, label: "Rich" },
];

export const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const HOUSEHOLD_HEAD_GENDER_OPTIONS = [{ value: 2, label: "Female-headed" }];

export const EXCLUSION_PROGRAM_OPTIONS = [
  { value: 1, label: "Social Cash Transfer" },
  { value: 2, label: "Public Works Programme" },
  { value: 3, label: "VSL/COMSIP" },
  { value: 4, label: "Microfinance" },
];

export const MSR_ETL_JOB_TYPE = {
  UBR_INDIVIDUALS_IMPORT: "ubr_individuals_import",
  UBR_LOCATIONS_IMPORT: "ubr_locations_import",
};
