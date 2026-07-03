const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeLocationSelection, getLocationFilterParams, getLocationCode, getLocationType } = require("./location");

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
    assert.strictEqual(getLocationType({ type: "D" }), "district");
    assert.strictEqual(getLocationType({ type: "d" }), "district");
  });

  await t.test("recognizes ta type", () => {
    assert.strictEqual(getLocationType({ type: "W" }), "ta");
    assert.strictEqual(getLocationType({ locationType: "traditional_authority" }), "ta");
  });

  await t.test("recognizes gvh type", () => {
    assert.strictEqual(getLocationType({ type: "G" }), "gvh");
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
        code: "10101",
        name: "TA One",
        type: "W",
        parent: {
          code: "101",
          name: "District One",
          type: "D",
        },
      },
    };

    assert.deepStrictEqual(normalizeLocationSelection(selection), {
      district: "101",
      ta: "10101",
      village: "10101001",
    });
  });

  await t.test("normalizes cascader array format", () => {
    const selection = [
      { code: "101", type: "D" },
      { code: "10101", type: "W" },
      { code: "10101001", type: "V" },
    ];

    assert.deepStrictEqual(normalizeLocationSelection(selection), {
      district: "101",
      ta: "10101",
      village: "10101001",
    });
  });

  await t.test("handles partial location selections", () => {
    const selection = {
      code: "10101",
      type: "W",
      parent: {
        code: "101",
        type: "D",
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
        code: "10101",
        type: "W",
        parent: {
          code: "101",
          type: "D",
        },
      },
    };

    assert.deepStrictEqual(getLocationFilterParams(selection), {
      district: "101",
      ta: "10101",
      village: "10101001",
    });
  });

  await t.test("excludes undefined values from params", () => {
    const params = getLocationFilterParams({ code: "101", type: "D" });
    assert.strictEqual(params.ta, undefined);
    assert.strictEqual(params.village, undefined);
  });
});
