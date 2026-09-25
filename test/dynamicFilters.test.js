const test = require("node:test");
const assert = require("node:assert/strict");

const { schemaRequiredFieldsSatisfied } = require("../src/util/dynamicFilters");

const LOCATION_FIELD = { name: "location", label: "Location", type: "location", required: true };
const GENDER_FIELD = { name: "gender", label: "Gender", type: "select", required: true };
const AGE_FIELD = { name: "minAge", label: "Min Age", type: "number", required: false };
const CLASSIFICATIONS_FIELD = { name: "classifications", label: "Classifications", type: "multiselect", required: true };

test("schemaRequiredFieldsSatisfied", async (t) => {
  await t.test("true for an empty schema", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied([], {}, undefined), true);
  });

  await t.test("true when there is no schema at all", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied(undefined, {}, undefined), true);
  });

  await t.test("optional fields never block, even when empty", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied([AGE_FIELD], {}, undefined), true);
  });

  await t.test("required location field needs at least a District", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied([LOCATION_FIELD], {}, undefined), false);
    assert.strictEqual(
      schemaRequiredFieldsSatisfied([LOCATION_FIELD], {}, { type: "R", code: "101" }),
      true,
    );
  });

  await t.test("required location field is satisfied by a deeper selection too", () => {
    const taNode = { type: "D", code: "10101", parent: { type: "R", code: "101" } };
    assert.strictEqual(schemaRequiredFieldsSatisfied([LOCATION_FIELD], {}, taNode), true);
  });

  await t.test("required scalar field needs a non-empty value", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied([GENDER_FIELD], {}, undefined), false);
    assert.strictEqual(schemaRequiredFieldsSatisfied([GENDER_FIELD], { gender: "" }, undefined), false);
    assert.strictEqual(schemaRequiredFieldsSatisfied([GENDER_FIELD], { gender: "Female" }, undefined), true);
  });

  await t.test("required multiselect field needs at least one value", () => {
    assert.strictEqual(schemaRequiredFieldsSatisfied([CLASSIFICATIONS_FIELD], { classifications: [] }, undefined), false);
    assert.strictEqual(
      schemaRequiredFieldsSatisfied([CLASSIFICATIONS_FIELD], { classifications: [1] }, undefined),
      true,
    );
  });

  await t.test("all required fields across the schema must be satisfied", () => {
    const filters = { gender: "Female" };
    assert.strictEqual(
      schemaRequiredFieldsSatisfied([LOCATION_FIELD, GENDER_FIELD], filters, undefined),
      false,
    );
    assert.strictEqual(
      schemaRequiredFieldsSatisfied([LOCATION_FIELD, GENDER_FIELD], filters, { type: "R", code: "101" }),
      true,
    );
  });
});

const { findSelectedOption, findSelectedOptions, translateLabel } = require("../src/util/dynamicFilters");

test("findSelectedOption", async (t) => {
  const options = [{ value: 1, label: "Male-headed" }, { value: false, label: "No" }];

  await t.test("null for empty values", () => {
    assert.strictEqual(findSelectedOption(options, null), null);
    assert.strictEqual(findSelectedOption(options, ""), null);
    assert.strictEqual(findSelectedOption(options, undefined), null);
  });

  await t.test("matches falsy option values like false", () => {
    assert.deepStrictEqual(findSelectedOption(options, false), options[1]);
  });
});

test("findSelectedOptions", async (t) => {
  const options = [{ value: 1, label: "Poorest" }, { value: 2, label: "Poorer" }];

  await t.test("empty for non-array values", () => {
    assert.deepStrictEqual(findSelectedOptions(options, null), []);
  });

  await t.test("returns matching options", () => {
    assert.deepStrictEqual(findSelectedOptions(options, [2]), [options[1]]);
  });
});

test("translateLabel", async (t) => {
  const intl = {
    messages: { "msr_etl.filters.gender": "Gender (translated)" },
    formatMessage: ({ id }) => intl.messages[id],
  };

  await t.test("uses the translation when the label is a known key", () => {
    assert.strictEqual(translateLabel(intl, "msr_etl", "filters.gender"), "Gender (translated)");
  });

  await t.test("falls back to the raw label", () => {
    assert.strictEqual(translateLabel(intl, "msr_etl", "Min Age"), "Min Age");
  });
});
