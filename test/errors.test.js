const test = require("node:test");
const assert = require("node:assert/strict");

const { translateMsrEtlError } = require("../src/util/errors");

const formatMessage = (id) => `translated:${id}`;

test("translateMsrEtlError", async (t) => {
  await t.test("returns null/undefined as-is", () => {
    assert.strictEqual(translateMsrEtlError(null, formatMessage), null);
    assert.strictEqual(translateMsrEtlError(undefined, formatMessage), undefined);
  });

  await t.test("translates a 502 via formatMessage", () => {
    const result = translateMsrEtlError({ code: 502, message: "Bad Gateway", detail: null }, formatMessage);
    assert.strictEqual(result.code, null);
    assert.strictEqual(result.detail, null);
    assert.strictEqual(result.message, "translated:errors.gatewayTimeout");
  });

  await t.test("translates 503 and 504 the same way", () => {
    assert.strictEqual(translateMsrEtlError({ code: 503 }, formatMessage).message, "translated:errors.gatewayTimeout");
    assert.strictEqual(translateMsrEtlError({ code: 504 }, formatMessage).message, "translated:errors.gatewayTimeout");
  });

  await t.test("leaves non-gateway errors untouched", () => {
    const error = { code: 400, message: "Bad request", detail: "district is required" };
    assert.deepStrictEqual(translateMsrEtlError(error, formatMessage), error);
  });

  await t.test("leaves errors with no code untouched", () => {
    const error = { message: "GraphQL Error: something failed" };
    assert.deepStrictEqual(translateMsrEtlError(error, formatMessage), error);
  });
});
