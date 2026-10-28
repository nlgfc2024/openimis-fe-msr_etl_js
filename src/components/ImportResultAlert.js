import React from "react";
import { Button } from "@material-ui/core";
import { useModulesManager, useTranslations, Link } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import ImportStatusAlert from "./ImportStatusAlert";

const ImportResultAlert = ({ job, kind, route, syncLogRoute, source }) => {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const metrics = job.metrics ?? {};
  const values = {
    downloaded: metrics.staged ?? 0,
    imported: metrics.synced ?? 0,
    skipped: metrics.skipped ?? 0,
    failed: metrics.errors ?? 0,
    downloadFailed: metrics.download_errors ?? 0,
    noun: formatMessage(`jobProgress.${kind}`),
    source: source || formatMessage("importProgress.unknownSource"),
  };

  const actions = (
    <>
      {route && values.imported > 0 && (
        <Button color="inherit" variant="outlined" size="small" component={Link} to={route}>
          {formatMessage(`importResult.view.${kind}`)}
        </Button>
      )}
      {syncLogRoute && (
        <Button color="inherit" variant="outlined" size="small" component={Link} to={syncLogRoute}>
          {formatMessage("filters.viewSyncLog")}
        </Button>
      )}
    </>
  );

  const summary = () => {
    const sentences = [];
    if (values.downloaded === 0) {
      sentences.push(formatMessageWithValues("importResult.summary.nothingFound", values));
    } else if (values.imported === values.downloaded) {
      sentences.push(formatMessageWithValues("importResult.summary.all", values));
    } else {
      sentences.push(formatMessageWithValues("importResult.summary.some", values));
    }
    if (values.skipped > 0) sentences.push(formatMessageWithValues("importResult.skipped", values));
    if (values.failed > 0) sentences.push(formatMessageWithValues("importResult.failedCount", values));
    if (values.downloadFailed > 0) sentences.push(formatMessageWithValues("importResult.downloadFailed", values));
    return sentences.join(" ");
  };

  const outcome = {
    SUCCESS: ["success", "importResult.success.title", summary()],
    PARTIAL: ["warning", "importResult.partial.title", `${summary()} ${formatMessage("importResult.seeSyncLog")}`],
    FAILED: [
      "error",
      "importResult.failed.title",
      `${job.error ? `${job.error} ` : ""}${formatMessage("importResult.seeSyncLog")}`,
    ],
    CANCELLED: ["info", "importResult.cancelled.title", formatMessageWithValues("importResult.cancelled.body", values)],
  }[job.status];
  if (!outcome) return null;
  const [severity, titleKey, text] = outcome;

  return (
    <ImportStatusAlert severity={severity} title={formatMessage(titleKey)} actions={actions}>
      {text}
    </ImportStatusAlert>
  );
};

export default ImportResultAlert;
