const test = require("node:test");
const assert = require("node:assert/strict");

const { cameFromKobo } = require("../src/util/kobo");

test("cameFromKobo", async (t) => {
  await t.test("true for an individual imported from Kobo (jsonExt as the GraphQL string)", () => {
    assert.strictEqual(cameFromKobo({ jsonExt: JSON.stringify({ kobo_uuid: "u1", data_source: "kobo" }) }), true);
  });

  await t.test("true when jsonExt is already an object", () => {
    assert.strictEqual(cameFromKobo({ jsonExt: { kobo_uuid: "u1" } }), true);
  });

  await t.test("false for individuals from other sources", () => {
    assert.strictEqual(cameFromKobo({ jsonExt: JSON.stringify({ data_source: "pwp" }) }), false);
  });

  await t.test("false without an individual, jsonExt, or with unreadable jsonExt", () => {
    assert.strictEqual(cameFromKobo(undefined), false);
    assert.strictEqual(cameFromKobo({}), false);
    assert.strictEqual(cameFromKobo({ jsonExt: "{not json" }), false);
  });
});
