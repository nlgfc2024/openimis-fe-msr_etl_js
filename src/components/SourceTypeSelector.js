import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Autocomplete, formatMessage } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { fetchMsrEtlSourceTypes } from "../actions";
import { buildSourceTypeOptions, findSelectedOption } from "../util/options";

/**
 * SourceTypeSelector
 *
 * Lets the user pick which configured data source (msr_etl.source_registry /
 * MsrEtlConfig.sources on the backend) to pull from. Renders nothing while
 * fewer than two source_types are available, so nothing changes visually
 * until an admin actually configures a second source.
 */
function SourceTypeSelector({
  intl, kind, value, onChange, readOnly,
}) {
  const dispatch = useDispatch();
  const fetched = useSelector((state) => state.msrEtl.fetchedMsrEtlSourceTypes);
  const sourceTypes = useSelector((state) => (
    kind === "location" ? state.msrEtl.locationSourceTypes : state.msrEtl.individualSourceTypes
  ));

  useEffect(() => {
    if (!fetched) dispatch(fetchMsrEtlSourceTypes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sourceTypes.length < 2) return null;

  const options = buildSourceTypeOptions(sourceTypes);

  return (
    <Autocomplete
      module={MSR_ETL_MODULE_NAME}
      label={formatMessage(intl, MSR_ETL_MODULE_NAME, "filters.sourceType")}
      options={options}
      value={findSelectedOption(options, value)}
      onChange={(option) => onChange(option?.value ?? "")}
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option, v) => option.value === v?.value}
      readOnly={readOnly}
    />
  );
}

export default injectIntl(SourceTypeSelector);
