import { getUbrHouseholdLocationParams } from "./location.js";

/**
 * Build the ScheduleMsrUbrIndividualsImportMutationInput fields from the
 * Individuals tab's filter state. Pulled out of actions.js so the filter
 * encoding (in particular the boolean/Int edge cases) is testable without
 * a GraphQL dispatch context.
 *
 * @param {object} filters - Individuals tab filter state
 * @returns {object} Mutation input fields (without clientMutationId)
 */
function buildIndividualsImportInput(filters = {}) {
  const input = getUbrHouseholdLocationParams(filters.location);
  if (filters.classifications?.length) input.wealthQuintiles = filters.classifications.map((c) => c.value);
  if (filters.minAge != null) input.minAge = filters.minAge;
  if (filters.maxAge != null) input.maxAge = filters.maxAge;
  if (filters.gender) input.gender = filters.gender;
  if (filters.householdHasLabour !== "" && filters.householdHasLabour != null) {
    input.hasLabour = filters.householdHasLabour;
  }
  if (filters.householdHeadGender !== "" && filters.householdHeadGender != null) {
    input.householdHeadGender = filters.householdHeadGender;
  }
  if (filters.exclusionPrograms?.length) input.excludedProgrammeCodes = filters.exclusionPrograms;
  if (filters.lowerPercentileCategory != null) input.lowerPercentileCategory = filters.lowerPercentileCategory;
  if (filters.upperPercentileCategory != null) input.upperPercentileCategory = filters.upperPercentileCategory;
  return input;
}

export { buildIndividualsImportInput };

if (typeof module !== "undefined" && module.exports) {
  module.exports = { buildIndividualsImportInput };
}
