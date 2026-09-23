import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Autocomplete, formatMessage } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { fetchMsrEtlSourceTypes } from "../actions";
import { buildSourceTypeOptions, findSelectedOption } from "../util/options";

function SourceTypeSelector({ intl, kind, value, onChange, readOnly }) {
  const dispatch = useDispatch();
  const fetched = useSelector((state) => state.msrEtl.fetchedMsrEtlSourceTypes);
  const sourceTypes = useSelector((state) =>
    kind === "location" ? state.msrEtl.locationSourceTypes : state.msrEtl.individualSourceTypes,
  );

  useEffect(() => {
    if (!fetched) dispatch(fetchMsrEtlSourceTypes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLocked = sourceTypes.length < 2;

  useEffect(() => {
    if (sourceTypes.length === 1 && value !== sourceTypes[0].value) {
      onChange(sourceTypes[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceTypes]);

  const options = buildSourceTypeOptions(sourceTypes);

  return (
    <Autocomplete
      module={MSR_ETL_MODULE_NAME}
      label={formatMessage(intl, MSR_ETL_MODULE_NAME, "filters.sourceType")}
      options={options}
      value={findSelectedOption(options, value)}
      onChange={(option) => onChange(option?.value ?? "")}
      onInputChange={() => {}}
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option, v) => option.value === v?.value}
      readOnly={readOnly || isLocked}
      required
    />
  );
}

export default injectIntl(SourceTypeSelector);
