import React from "react";
import { Button, LinearProgress } from "@material-ui/core";
import { lighten, makeStyles } from "@material-ui/core/styles";
import { useModulesManager, useTranslations, Link } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import ImportStatusAlert from "./ImportStatusAlert";

const useStyles = makeStyles((theme) => ({
  bar: {
    marginTop: theme.spacing(1.5),
    height: 6,
    borderRadius: 3,
    backgroundColor: lighten(theme.palette.success.main, 0.75),
  },
  barFill: { backgroundColor: theme.palette.success.main },
}));

const ImportProgressCard = ({ job, percent, cancel, cancelling, kind, syncLogRoute, source }) => {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const metrics = job.metrics ?? {};
  const importing = percent !== null;
  const values = {
    noun: formatMessage(`jobProgress.${kind}`),
    source: source || formatMessage("importProgress.unknownSource"),
    downloaded: metrics.staged ?? 0,
    imported: metrics.synced ?? 0,
    total: job.total ?? 0,
  };

  let status;
  if (importing) status = formatMessageWithValues("importProgress.importing", values);
  else if (values.downloaded > 0) status = formatMessageWithValues("importProgress.downloading", values);
  else status = formatMessage("importProgress.starting");

  return (
    <ImportStatusAlert
      severity="success"
      neutral
      title={formatMessageWithValues(
        importing ? "importProgress.title.importing" : "importProgress.title.downloading",
        values,
      )}
      actions={
        <>
          <Button color="inherit" variant="outlined" size="small" onClick={cancel} disabled={cancelling}>
            {formatMessage("importProgress.cancel")}
          </Button>
          {syncLogRoute && (
            <Button color="inherit" variant="outlined" size="small" component={Link} to={syncLogRoute}>
              {formatMessage("filters.viewSyncLog")}
            </Button>
          )}
        </>
      }
      footer={
        <LinearProgress
          classes={{ root: classes.bar, barColorPrimary: classes.barFill }}
          variant={importing ? "determinate" : "indeterminate"}
          value={percent ?? 0}
        />
      }
    >
      {`${status} ${formatMessage("importProgress.reassurance")}`}
    </ImportStatusAlert>
  );
};

export default ImportProgressCard;
