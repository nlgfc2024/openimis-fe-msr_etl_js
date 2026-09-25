import React from "react";
import { injectIntl } from "react-intl";
import { Autocomplete, NumberInput, PublishedComponent, TextInput, formatMessage } from "@openimis/fe-core";

import { findSelectedOption, findSelectedOptions, translateLabel } from "../util/dynamicFilters";

const KNOWN_TYPES = ["text", "number", "boolean", "select", "multiselect", "location"];

/**
 * Renders one filter input from a filter_schema field definition:
 * {name, label, type, required?, options?, min?, max?, maxLevel?}.
 * Cleared values are always null.
 */
function DynamicFilterField({ intl, module, field, value, onChange, readOnly }) {
  const { type = "text", required, options = [] } = field;
  const label = translateLabel(intl, module, field.label);
  const common = { module, label, readOnly, required: !!required };

  const autocompleteProps = {
    ...common,
    onInputChange: () => {},
    getOptionLabel: (option) => option.label,
    getOptionSelected: (option, v) => option.value === v?.value,
  };

  switch (type) {
    case "location":
      return (
        <PublishedComponent
          pubRef="location.LocationCascader"
          value={value}
          onChange={onChange}
          withLabel
          label={label}
          readOnly={readOnly}
          required={!!required}
          maxLevel={field.maxLevel}
        />
      );

    case "number":
      return (
        <NumberInput
          {...common}
          min={field.min}
          max={field.max}
          value={value}
          onChange={(v) => onChange(v === "" || v === undefined ? null : v)}
        />
      );

    case "boolean": {
      const booleanOptions = [
        { value: true, label: formatMessage(intl, module, "filters.yes") },
        { value: false, label: formatMessage(intl, module, "filters.no") },
      ];
      return (
        <Autocomplete
          {...autocompleteProps}
          options={booleanOptions}
          value={findSelectedOption(booleanOptions, value)}
          onChange={(option) => onChange(option?.value ?? null)}
        />
      );
    }

    case "multiselect":
      return (
        <Autocomplete
          {...autocompleteProps}
          multiple
          options={options}
          value={findSelectedOptions(options, value)}
          onChange={(selected) => onChange(selected?.length ? selected.map((option) => option.value) : null)}
        />
      );

    case "select":
      return (
        <Autocomplete
          {...autocompleteProps}
          options={options}
          value={findSelectedOption(options, value)}
          onChange={(option) => onChange(option?.value ?? null)}
        />
      );

    default:
      if (!KNOWN_TYPES.includes(type)) {
        console.warn(`msr_etl filter_schema: unknown type '${type}' for field '${field.name}', rendering as text`);
      }
      return <TextInput {...common} value={value} onChange={(v) => onChange(v === "" ? null : v)} />;
  }
}

export default injectIntl(DynamicFilterField);
