function msrEtlMetricLabels(formatMessage) {
  return {
    staged: formatMessage("jobMetrics.staged"),
    synced: formatMessage("jobMetrics.synced"),
    skipped: formatMessage("jobMetrics.skipped"),
    errors: formatMessage("jobMetrics.errors"),
    download_errors: formatMessage("jobMetrics.downloadErrors"),
  };
}

export { msrEtlMetricLabels };
