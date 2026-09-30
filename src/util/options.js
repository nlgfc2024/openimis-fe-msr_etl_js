/**
 * Resolve the selected option for a single-select Autocomplete from a plain
 * value. `false` is a real selection ("No"), not an unset filter - only the
 * empty-string/null/undefined sentinel means nothing is selected.
 *
 * @param {Array<{value: *, label: string}>} options
 * @param {*} value
 * @returns {object|null} The matching option, or null if unset/unmatched
 */
function findSelectedOption(options, value) {
  if (value === "" || value === null || value === undefined) return null;
  return options.find((option) => option.value === value) || null;
}

/**
 * Turn the msrEtlSourceTypes query's {value, label} pairs into Autocomplete
 * options. Falls back to the capitalized source_type key when the admin
 * hasn't configured a display_name for that source.
 *
 * @param {Array<{value: string, label: string|null}>} sourceTypes
 * @returns {Array<{value: string, label: string}>}
 */
function buildSourceTypeOptions(sourceTypes) {
  if (!Array.isArray(sourceTypes)) return [];
  return sourceTypes.map((sourceType) => ({
    value: sourceType.value,
    label: sourceType.label || (sourceType.value.charAt(0).toUpperCase() + sourceType.value.slice(1)),
  }));
}

export { findSelectedOption, buildSourceTypeOptions };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { findSelectedOption, buildSourceTypeOptions };
}
