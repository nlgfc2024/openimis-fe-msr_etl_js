export const MSR_ETL_MODULE_NAME = "msrEtl";

export const RIGHT_MSR_ETL_SEARCH = 953001;
export const RIGHT_MSR_ETL_EXPORT = 953002;

export const MSR_ETL_JOB_TYPE = {
  UBR_INDIVIDUALS_IMPORT: "ubr_individuals_import",
  UBR_LOCATIONS_IMPORT: "ubr_locations_import",
};

export const IMPORTED_RECORDS_ROUTE = {
  individuals: "/individuals",
  locations: "/location/locations",
};

export const MSR_ETL_TAB = {
  LOCATION: 0,
  INDIVIDUALS: 1,
  LOGS: 2,
};
export const MSR_ETL_TAB_SLUGS = ["location", "individuals", "logs"];

export const LOCATION_LEVELS = [
  { pubRef: "location.MwDistrictPicker", label: "locationLevel.district" },
  { pubRef: "location.MwTAPicker", label: "locationLevel.ta" },
  { pubRef: "location.MwGVHPicker", label: "locationLevel.gvh" },
  { pubRef: "location.MwVillagePicker", label: "locationLevel.village" },
];
