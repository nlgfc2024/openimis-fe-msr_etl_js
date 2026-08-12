const GATEWAY_STATUS_CODES = [502, 503, 504];

// A 502/503/504 is a proxy failure, not a job outcome - not actionable as-is
function translateMsrEtlError(error, formatMessage) {
  if (!error || !GATEWAY_STATUS_CODES.includes(Number(error.code))) return error;
  return {
    code: null,
    message: formatMessage("errors.gatewayTimeout"),
    detail: null,
  };
}

export { translateMsrEtlError };

if (typeof module !== "undefined" && module.exports) {
  module.exports = { translateMsrEtlError };
}
