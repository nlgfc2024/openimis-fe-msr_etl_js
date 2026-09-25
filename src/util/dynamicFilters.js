import { normalizeLocationSelection } from "./location";

/**
 * True once every field the source's filter_schema marks required has a
 * value.
 *
 * @param {Array<object>} schema - a source's filter_schema (from msrEtlSourceTypes)
 * @param {object} filters - current `edited.filters` values, keyed by field.name
 * @param {*} locationValue - current `edited.location` (raw LocationCascader value)
 * @returns {boolean}
 */
function schemaRequiredFieldsSatisfied(schema, filters, locationValue) {
  return (schema || []).every((field) => {
    if (!field.required) return true;

    if (field.type === "location") {
      return !!normalizeLocationSelection(locationValue).district;
    }

    const value = filters?.[field.name];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  });
}

function findSelectedOption(options, value) {
  if (value === "" || value === null || value === undefined) return null;
  return (options || []).find((option) => option.value === value) || null;
}

function findSelectedOptions(options, values) {
  if (!Array.isArray(values)) return [];
  return (options || []).filter((option) => values.includes(option.value));
}

// Admin labels may be translation keys; fall back to the raw string.
function translateLabel(intl, module, label) {
  if (!label) return label;
  const key = `${module}.${label}`;
  return intl?.messages?.[key] ? intl.formatMessage({ id: key }) : label;
}

export { schemaRequiredFieldsSatisfied, findSelectedOption, findSelectedOptions, translateLabel };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { schemaRequiredFieldsSatisfied, findSelectedOption, findSelectedOptions, translateLabel };
}
