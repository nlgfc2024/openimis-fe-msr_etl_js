# openimis-fe-msr_etl_configs_js
## Geospatial source

The existing Location import tab owns MSR geospatial synchronization. The backend source schema can use `type: "district"` with `name: "district_uuid"`; this renders the existing published CoreMIS district picker. Import progress and cancellation continue to reuse core components. The separate Mapping dashboard displays accepted CoreMIS geography and no longer starts imports.
