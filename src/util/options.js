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

export { findSelectedOption };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { findSelectedOption };
}
