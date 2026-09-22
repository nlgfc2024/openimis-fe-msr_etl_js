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
 * Turn a list of source_type keys (from the msrEtlSourceTypes query) into
 * Autocomplete options. There's no display name from the backend - just the
 * key, capitalized.
 *
 * @param {Array<string>} sourceTypes
 * @returns {Array<{value: string, label: string}>}
 */
function buildSourceTypeOptions(sourceTypes) {
  if (!Array.isArray(sourceTypes)) return [];
  return sourceTypes.map((sourceType) => ({
    value: sourceType,
    label: sourceType.charAt(0).toUpperCase() + sourceType.slice(1),
  }));
}

export { findSelectedOption, buildSourceTypeOptions };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { findSelectedOption, buildSourceTypeOptions };
}
