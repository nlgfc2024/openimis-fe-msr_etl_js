const test = require("node:test");
const assert = require("node:assert/strict");

const { buildIndividualsImportInput } = require("../src/util/individualsImportInput");

const VALID_LOCATION = { district: "101", ta: "10101" };

test("Individuals import input - householdHasLabour", async (t) => {
  await t.test("sends true when Yes is selected", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHasLabour: true });
    assert.strictEqual(input.hasLabour, true);
  });

  await t.test("sends false when No is selected, not dropped", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHasLabour: false });
    assert.strictEqual(input.hasLabour, false);
  });

  await t.test("omits hasLabour when unset", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHasLabour: "" });
    assert.strictEqual("hasLabour" in input, false);
  });

  await t.test("omits hasLabour when filter absent entirely", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION });
    assert.strictEqual("hasLabour" in input, false);
  });
});

test("Individuals import input - householdHeadGender", async (t) => {
  await t.test("sends the confirmed Female Int code when selected", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHeadGender: 2 });
    assert.strictEqual(input.householdHeadGender, 2);
    assert.strictEqual(typeof input.householdHeadGender, "number");
  });

  await t.test("sends the confirmed Male Int code when selected", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHeadGender: 1 });
    assert.strictEqual(input.householdHeadGender, 1);
    assert.strictEqual(typeof input.householdHeadGender, "number");
  });

  await t.test("omits householdHeadGender when unset", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHeadGender: "" });
    assert.strictEqual("householdHeadGender" in input, false);
  });

  await t.test("never sends a boolean for householdHeadGender", () => {
    const input = buildIndividualsImportInput({ location: VALID_LOCATION, householdHeadGender: 2 });
    assert.notStrictEqual(input.householdHeadGender, true);
    assert.notStrictEqual(input.householdHeadGender, false);
  });
});

test("Individuals import input - other filters unaffected", async (t) => {
  await t.test("still includes location, age, and classification filters", () => {
    const input = buildIndividualsImportInput({
      location: VALID_LOCATION,
      minAge: 18,
      maxAge: 60,
      classifications: [{ value: 1 }, { value: 2 }],
    });
    assert.strictEqual(input.district, "101");
    assert.strictEqual(input.ta, "10101");
    assert.strictEqual(input.minAge, 18);
    assert.strictEqual(input.maxAge, 60);
    assert.deepStrictEqual(input.wealthQuintiles, [1, 2]);
  });
});

test("Individuals import input - module exports", () => {
  assert.strictEqual(typeof buildIndividualsImportInput, "function");
});
