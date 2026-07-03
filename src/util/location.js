// Location type constants
const LOCATION_TYPES = {
  DISTRICT: "district",
  TA: "ta",
  GVH: "gvh",
  VILLAGE: "village",
};

const LOCATION_TYPE_ALIASES = {
  district: ["d"],
  ta: ["w", "traditional_authority", "traditional-authority", "traditional authority"],
  gvh: ["g", "group_village_head", "group-village-head", "group village head"],
  village: ["v"],
};

const LOCATION_CODE_FIELDS = ["code", "value", "id", "uuid"];
const LOCATION_PARENT_FIELDS = ["parent", "parentLocation", "parent_location"];

/**
 * Extract location code from various value formats.
 * Handles string, number, and object formats with fallback field resolution.
 *
 * @param {string|number|object} value - The value to extract code from
 * @returns {string|null} Normalized location code or null if not found
 */
function getLocationCode(value) {
  if (!value) return null;

  // Handle primitive types
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  // Handle object types with multiple field possibilities
  if (typeof value === "object") {
    for (const field of LOCATION_CODE_FIELDS) {
      const fieldValue = value[field];
      if (fieldValue) {
        const code = typeof fieldValue === "string" ? fieldValue.trim() : String(fieldValue);
        if (code) return code;
      }
    }
  }

  return null;
}

/**
 * Determine location type from various value formats.
 * Maps aliases to canonical location types (district, ta, village).
 *
 * @param {object} value - The location object to inspect
 * @returns {string|null} Canonical location type or null if not recognized
 */
function getLocationType(value) {
  if (!value || typeof value !== "object") return null;

  const rawType = value.type || value.locationType || value.level || value.location_level || value.locationTypeCode;
  if (!rawType) return null;

  const normalized = String(rawType).toLowerCase();

  for (const [type, aliases] of Object.entries(LOCATION_TYPE_ALIASES)) {
    if (normalized === type || aliases.includes(normalized)) {
      return type;
    }
  }

  return null;
}

/**
 * Recursively traverse location parent hierarchy.
 * Collects district, ta, and village codes from nested location objects.
 *
 * @param {object} node - Location node to traverse
 * @param {object} result - Accumulator for collected codes
 * @private
 */
function traverseLocationHierarchy(node, result) {
  if (!node || typeof node !== "object") return;

  const type = getLocationType(node);
  const code = getLocationCode(node);

  if (type && code) {
    result[type] = code;
  }

  // Traverse parent relationships
  for (const parentField of LOCATION_PARENT_FIELDS) {
    if (node[parentField]) {
      traverseLocationHierarchy(node[parentField], result);
    }
  }
}

/**
 * Normalize location selection from various input formats.
 * Handles cascader array output and hierarchical objects.
 * Returns standardized object with district, ta, and village codes.
 *
 * @param {Array|object} value - Location selection (from cascader or object)
 * @returns {object} Normalized location with district, ta, village keys
 */
function normalizeLocationSelection(value) {
  if (!value) return {};

  const result = {};

  // Handle array format (cascader output)
  if (Array.isArray(value)) {
    value.forEach((item) => {
      const type = getLocationType(item);
      const code = getLocationCode(item);
      if (type && code) {
        result[type] = code;
      }
    });
    return result;
  }

  // Handle object format
  if (typeof value === "object") {
    // Check for direct location code fields
    const directKeys = Object.keys(LOCATION_TYPES);
    for (const key of directKeys) {
      const typeKey = LOCATION_TYPES[key];
      const directValue = value[typeKey];
      if (directValue) {
        result[typeKey] = getLocationCode(directValue) || directValue;
      }
    }

    if (Object.keys(result).length > 0) {
      return result;
    }

    // Traverse hierarchy if direct fields not found
    traverseLocationHierarchy(value, result);
    return result;
  }

  return {};
}

/**
 * Convert normalized location to GraphQL query parameters.
 * Filters out empty values for clean API calls.
 *
 * @param {object} location - Location object (with district, ta, village keys)
 * @returns {object} Query parameters with only non-empty values
 */
function getLocationFilterParams(location) {
  const normalized = normalizeLocationSelection(location);
  const params = {};

  Object.entries(normalized).forEach(([key, value]) => {
    if (value) {
      params[key] = value;
    }
  });

  return params;
}

export { getLocationCode, getLocationType, normalizeLocationSelection, getLocationFilterParams, LOCATION_TYPES };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getLocationCode,
    getLocationType,
    normalizeLocationSelection,
    getLocationFilterParams,
    LOCATION_TYPES,
  };
}
