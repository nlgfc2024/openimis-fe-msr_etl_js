const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeLocationSelection,
  getLocationFilterParams,
  getUbrHouseholdLocationParams,
  getLocationCode,
  getLocationType,
} = require("../src/util/location");

// Test suite: Location normalization
test("Location Code Extraction", async (t) => {
  await t.test("extracts code from string", () => {
    assert.strictEqual(getLocationCode("  101  "), "101");
  });

  await t.test("extracts code from number", () => {
    assert.strictEqual(getLocationCode(101), "101");
  });

  await t.test("extracts code from object with code field", () => {
    assert.strictEqual(getLocationCode({ code: "101" }), "101");
  });

  await t.test("returns null for empty value", () => {
    assert.strictEqual(getLocationCode(null), null);
    assert.strictEqual(getLocationCode(undefined), null);
  });
});

test("Location Type Detection", async (t) => {
  await t.test("recognizes district type", () => {
    assert.strictEqual(getLocationType({ type: "R" }), "district");
    assert.strictEqual(getLocationType({ type: "r" }), "district");
  });

  await t.test("recognizes ta type", () => {
    assert.strictEqual(getLocationType({ type: "D" }), "ta");
    assert.strictEqual(getLocationType({ locationType: "traditional_authority" }), "ta");
  });

  await t.test("recognizes gvh type", () => {
    assert.strictEqual(getLocationType({ type: "W" }), "gvh");
    assert.strictEqual(getLocationType({ locationType: "group_village_head" }), "gvh");
  });

  await t.test("recognizes village type", () => {
    assert.strictEqual(getLocationType({ type: "V" }), "village");
    assert.strictEqual(getLocationType({ level: "v" }), "village");
  });
});

test("Location Normalization", async (t) => {
  await t.test("normalizes hierarchical location object", () => {
    const selection = {
      code: "10101001",
      name: "Village A",
      type: "V",
      parent: {
        code: "1010101",
        name: "GVH One",
        type: "W",
        parent: {
          code: "10101",
          name: "TA One",
          type: "D",
          parent: {
            code: "101",
            name: "District One",
            type: "R",
          },
        },
      },
    };

    assert.deepStrictEqual(normalizeLocationSelection(selection), {
      district: "101",
      ta: "10101",
      gvh: "1010101",
      village: "10101001",
    });
  });

  await t.test("normalizes cascader array format", () => {
    const selection = [
      { code: "101", type: "R" },
      { code: "10101", type: "D" },
      { code: "1010101", type: "W" },
      { code: "10101001", type: "V" },
    ];

    assert.deepStrictEqual(normalizeLocationSelection(selection), {
      district: "101",
      ta: "10101",
      gvh: "1010101",
      village: "10101001",
    });
  });

  await t.test("handles partial location selections", () => {
    const selection = {
      code: "10101",
      type: "D",
      parent: {
        code: "101",
        type: "R",
      },
    };

    assert.deepStrictEqual(normalizeLocationSelection(selection), {
      district: "101",
      ta: "10101",
    });
  });
});

test("Location Filter Parameters", async (t) => {
  await t.test("converts normalized location to filter params", () => {
    const selection = {
      code: "10101001",
      type: "V",
      parent: {
        code: "1010101",
        type: "W",
        parent: {
          code: "10101",
          type: "D",
          parent: {
            code: "101",
            type: "R",
          },
        },
      },
    };

    assert.deepStrictEqual(getLocationFilterParams(selection), {
      district: "101",
      ta: "10101",
      gvh: "1010101",
      village: "10101001",
    });
  });

  await t.test("excludes undefined values from params", () => {
    const params = getLocationFilterParams({ code: "101", type: "R" });
    assert.strictEqual(params.ta, undefined);
    assert.strictEqual(params.gvh, undefined);
    assert.strictEqual(params.village, undefined);
  });
});

test("UBR Household Location Parameters", async (t) => {
  await t.test("returns the complete hierarchy in relationship order", () => {
    const selection = {
      district: "101",
      ta: "10101",
      gvh: "1010101",
      village: "101010101",
    };

    assert.deepStrictEqual(getUbrHouseholdLocationParams(selection), {
      district: "101",
      ta: "10101",
      gvh: "1010101",
      village: "101010101",
    });
  });

  await t.test("allows a TA-scoped request without GVH or Village", () => {
    assert.deepStrictEqual(
      getUbrHouseholdLocationParams({ district: "101", ta: "10101" }),
      { district: "101", ta: "10101" },
    );
  });

  await t.test("rejects Village when its parent GVH is missing", () => {
    assert.throws(
      () => getUbrHouseholdLocationParams({
        district: "101",
        ta: "10101",
        village: "101010101",
      }),
      /GVH is required when Village is provided/,
    );
  });

  await t.test("rejects requests missing District or TA", () => {
    assert.throws(
      () => getUbrHouseholdLocationParams({ district: "101" }),
      /District and TA are required/,
    );
  });
});
