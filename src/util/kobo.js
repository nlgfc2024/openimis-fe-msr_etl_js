// Only individuals imported from a Kobo form have an application to show
function cameFromKobo(individual) {
  let jsonExt = individual?.jsonExt;
  if (typeof jsonExt === "string") {
    try {
      jsonExt = JSON.parse(jsonExt);
    } catch (e) {
      return false;
    }
  }
  return !!jsonExt?.kobo_uuid;
}

export { cameFromKobo };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { cameFromKobo };
}
