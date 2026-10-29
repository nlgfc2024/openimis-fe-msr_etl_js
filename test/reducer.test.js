const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

// fe-core isn't installed for node tests; the reducer only needs its formatters
const loadModule = Module._load;
Module._load = function load(request, ...rest) {
  if (request === "@openimis/fe-core") {
    return { formatServerError: (e) => e, formatGraphQLError: () => null, parseData: () => [], pageInfo: () => ({}) };
  }
  return loadModule.call(this, request, ...rest);
};

const { default: reducer, ACTION_TYPE } = require("../src/reducer");
const { REQUEST, SUCCESS, CLEAR } = require("../src/util/action-type");
const { MSR_ETL_JOB_TYPE } = require("../src/constants");

const activeJob = (clientMutationId, params) => ({
  type: SUCCESS(ACTION_TYPE.FETCH_ACTIVE_MSR_ETL_JOB),
  meta: { jobType: MSR_ETL_JOB_TYPE.UBR_INDIVIDUALS_IMPORT },
  payload: { data: { asyncJobs: { edges: [{ node: { clientMutationId, params } }] } } },
});

test("tracked job source", async (t) => {
  await t.test("a scheduled import keeps the source it was started with", () => {
    const state = reducer(undefined, {
      type: REQUEST(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT),
      meta: { clientMutationId: "a", sourceType: "pwp" },
    });
    assert.strictEqual(state.scheduledUbrIndividualsImportSourceType, "pwp");
  });

  await t.test("a reopened job takes its source from the job's params", () => {
    const state = reducer(undefined, activeJob("b", JSON.stringify({ source_type: "sctp", upload_id: "x" })));
    assert.strictEqual(state.scheduledUbrIndividualsImportClientMutationId, "b");
    assert.strictEqual(state.scheduledUbrIndividualsImportSourceType, "sctp");
  });

  await t.test("a job naming no source ran on the default one", () => {
    assert.strictEqual(reducer(undefined, activeJob("c", "{}")).scheduledUbrIndividualsImportSourceType, "ubr");
    const initialPull = reducer(undefined, {
      type: REQUEST(ACTION_TYPE.SCHEDULE_UBR_LOCATIONS_IMPORT),
      meta: { clientMutationId: "d" },
    });
    assert.strictEqual(initialPull.scheduledUbrLocationsImportSourceType, "ubr");
  });

  await t.test("an active job doesn't replace the one already tracked", () => {
    const scheduled = reducer(undefined, {
      type: REQUEST(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT),
      meta: { clientMutationId: "a", sourceType: "pwp" },
    });
    const state = reducer(scheduled, activeJob("b", JSON.stringify({ source_type: "sctp" })));
    assert.strictEqual(state.scheduledUbrIndividualsImportClientMutationId, "a");
    assert.strictEqual(state.scheduledUbrIndividualsImportSourceType, "pwp");
  });

  await t.test("clearing forgets the source", () => {
    const state = reducer(reducer(undefined, activeJob("b", "{}")), {
      type: CLEAR(ACTION_TYPE.SCHEDULE_UBR_INDIVIDUALS_IMPORT),
    });
    assert.strictEqual(state.scheduledUbrIndividualsImportSourceType, null);
  });
});
