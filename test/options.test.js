const test = require("node:test");
const assert = require("node:assert/strict");

const { findSelectedOption, buildSourceTypeOptions } = require("../src/util/options");

const YES_NO_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

test("findSelectedOption", async (t) => {
  await t.test("preserves an explicit false selection (No)", () => {
    const selected = findSelectedOption(YES_NO_OPTIONS, false);
    assert.deepStrictEqual(selected, { value: false, label: "No" });
  });

  await t.test("preserves an explicit true selection (Yes)", () => {
    const selected = findSelectedOption(YES_NO_OPTIONS, true);
    assert.deepStrictEqual(selected, { value: true, label: "Yes" });
  });

  await t.test("treats empty string as unset", () => {
    assert.strictEqual(findSelectedOption(YES_NO_OPTIONS, ""), null);
  });

  await t.test("treats null as unset", () => {
    assert.strictEqual(findSelectedOption(YES_NO_OPTIONS, null), null);
  });

  await t.test("treats undefined as unset", () => {
    assert.strictEqual(findSelectedOption(YES_NO_OPTIONS, undefined), null);
  });

  await t.test("returns null for an unmatched value", () => {
    assert.strictEqual(findSelectedOption(YES_NO_OPTIONS, "nope"), null);
  });

  await t.test("matches a numeric-coded option (e.g. household head gender)", () => {
    const options = [{ value: 2, label: "Female-headed" }];
    assert.deepStrictEqual(findSelectedOption(options, 2), { value: 2, label: "Female-headed" });
  });

  await t.test("does not confuse 0 with unset", () => {
    const options = [{ value: 0, label: "Zero" }, { value: 1, label: "One" }];
    assert.deepStrictEqual(findSelectedOption(options, 0), { value: 0, label: "Zero" });
  });
});

test("buildSourceTypeOptions", async (t) => {
  await t.test("uses the configured display_name as the label", () => {
    assert.deepStrictEqual(
      buildSourceTypeOptions([
        { value: "ubr", label: "Malawi Social Registry (MSR)" },
        { value: "sctp", label: "SCTP MIS" },
      ]),
      [
        { value: "ubr", label: "Malawi Social Registry (MSR)" },
        { value: "sctp", label: "SCTP MIS" },
      ],
    );
  });

  await t.test("falls back to a capitalized source_type when label is unset", () => {
    assert.deepStrictEqual(
      buildSourceTypeOptions([
        { value: "ubr", label: null },
        { value: "acme", label: "" },
      ]),
      [
        { value: "ubr", label: "Ubr" },
        { value: "acme", label: "Acme" },
      ],
    );
  });

  await t.test("returns an empty array for a non-array input", () => {
    assert.deepStrictEqual(buildSourceTypeOptions(undefined), []);
    assert.deepStrictEqual(buildSourceTypeOptions(null), []);
  });

  await t.test("returns an empty array for an empty list", () => {
    assert.deepStrictEqual(buildSourceTypeOptions([]), []);
  });
});
