import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import { useModulesManager, useTranslations, Searcher, Link } from "@openimis/fe-core";
import { injectIntl } from "react-intl";

import { MSR_ETL_MODULE_NAME } from "../../constants";
import { fetchRecentMsrEtlJobs } from "../../actions";

const styles = () => ({});

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

const JOB_STATUS_COLOR = {
  SUCCESS: "primary",
  FAILED: "secondary",
  PARTIAL: "secondary",
  CANCELLED: "secondary",
};

const HEADERS = ["logs.jobType", "logs.status", "logs.createdAt", "logs.finishedAt", "logs.error", "logs.details"];

function MsrEtlLogsTab() {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatDateTimeFromISO } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const jobs = useSelector((state) => state.msrEtl.recentMsrEtlJobs);
  const jobsPageInfo = useSelector((state) => state.msrEtl.recentMsrEtlJobsPageInfo);
  const fetching = useSelector((state) => state.msrEtl.fetchingRecentMsrEtlJobs);
  const fetched = useSelector((state) => state.msrEtl.fetchedRecentMsrEtlJobs);
  const error = useSelector((state) => state.msrEtl.errorRecentMsrEtlJobs);

  const fetch = (params) => dispatch(fetchRecentMsrEtlJobs(params));

  const headers = () => HEADERS;

  const itemFormatters = () => [
    (job) => job.jobType,
    (job) => <Chip size="small" label={job.status} color={JOB_STATUS_COLOR[job.status]} />,
    (job) => (job.createdAt ? formatDateTimeFromISO(job.createdAt) : ""),
    (job) => (job.finishedAt ? formatDateTimeFromISO(job.finishedAt) : ""),
    (job) => job.error,
    (job) =>
      job.clientMutationId && (
        <Link to={`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.syncLog`)}/${job.clientMutationId}`}>
          {formatMessage("logs.viewSyncLog")}
        </Link>
      ),
  ];

  const rowIdentifier = (job) => job.uuid;

  const defaultFilters = () => ({
    module: { value: "msr_etl", filter: `module: "msr_etl"` },
  });

  return (
    <Searcher
      module={MSR_ETL_MODULE_NAME}
      fetch={fetch}
      items={jobs}
      itemsPageInfo={jobsPageInfo}
      fetchingItems={fetching}
      fetchedItems={fetched}
      errorItems={error}
      tableTitle={formatMessage("logs.pageTitle")}
      headers={headers}
      itemFormatters={itemFormatters}
      rowIdentifier={rowIdentifier}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="-createdAt"
      defaultFilters={defaultFilters()}
    />
  );
}

export default injectIntl(withTheme(withStyles(styles)(MsrEtlLogsTab)));
