const test = require("node:test");
const assert = require("node:assert/strict");

const { createUploadTracker } = require("../src/util/uploadTracker");

test("createUploadTracker", async (t) => {
  await t.test("only the latest upload is current, and starting a new one aborts the previous", () => {
    const tracker = createUploadTracker();
    const first = tracker.start();
    const second = tracker.start();

    assert.strictEqual(first.isCurrent(), false);
    assert.strictEqual(first.signal.aborted, true);
    assert.strictEqual(second.isCurrent(), true);
  });

  await t.test("cancelling (programme change, Clear, unmount) makes a pending upload stale", () => {
    const tracker = createUploadTracker();
    const request = tracker.start();
    tracker.cancel();

    assert.strictEqual(request.isCurrent(), false);
    assert.strictEqual(request.signal.aborted, true);
  });

  await t.test("cancelling with nothing pending is harmless", () => {
    const tracker = createUploadTracker();
    tracker.cancel();
    assert.strictEqual(tracker.start().isCurrent(), true);
  });
});
