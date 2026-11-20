const test = require("node:test");
const assert = require("node:assert/strict");

const { cameFromKobo, formatFileSize, previewKind } = require("../src/util/kobo");

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

test("formatFileSize", async (t) => {
  await t.test("bytes, kilobytes and megabytes", () => {
    assert.strictEqual(formatFileSize(512), "512 B");
    assert.strictEqual(formatFileSize(87676), "85.6 KB");
    assert.strictEqual(formatFileSize(5 * 1024 * 1024), "5.0 MB");
  });

  await t.test("a dash when the size isn't known yet", () => {
    assert.strictEqual(formatFileSize(null), "-");
    assert.strictEqual(formatFileSize(undefined), "-");
  });
});

test("previewKind", async (t) => {
  await t.test("PDFs and images are shown in the page", () => {
    assert.strictEqual(previewKind("application/pdf"), "pdf");
    assert.strictEqual(previewKind("image/png"), "image");
    assert.strictEqual(previewKind("image/jpeg"), "image");
  });

  await t.test("anything else is download only", () => {
    assert.strictEqual(previewKind("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), null);
    assert.strictEqual(previewKind("image/svg+xml"), null);
    assert.strictEqual(previewKind(""), null);
  });
});
