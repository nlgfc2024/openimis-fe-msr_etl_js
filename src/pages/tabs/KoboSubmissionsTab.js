import React, { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useGraphqlQuery, useModulesManager, useTranslations } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../../constants";

const SUBMISSION_STATUSES = ["HELD", "IMPORTED", "UPDATED", "NO_NATIONAL_ID", "INVALID", "RECEIVED"];
const DOCUMENT_STATUSES = ["STORED", "PENDING", "FAILED"];
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const useStyles = makeStyles((theme) => ({
  detailsCell: { paddingTop: 0, paddingBottom: 0 },
  statusFilter: { flex: "1 1 15%", minWidth: "12em", marginRight: theme.spacing(2) },
  searchFilter: { flex: "1 1 30%", minWidth: "16em" },
}));

const STATUS_COLOR = { HELD: "secondary", INVALID: "secondary", NO_NATIONAL_ID: "secondary" };

const SUBMISSIONS_QUERY = `query MsrEtlKoboSubmissions($status: String, $search: String, $first: Int, $offset: Int) {
  koboSubmissions(status: $status, search: $search, first: $first, offset: $offset) {
    totalCount
    summary
    items {
      id koboId submittedAt status reason nationalId firstName lastName individualId comparison
      documents documentsStored
    }
  }
}`;

function Comparison({ submission, formatMessage, modulesManager }) {
  return (
    <Box m={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage("koboSubmissions.comparison.field")}</TableCell>
            <TableCell>{formatMessage("koboSubmissions.comparison.mis")}</TableCell>
            <TableCell>{formatMessage("koboSubmissions.comparison.applied")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submission.comparison.map((row) => (
            <TableRow key={row.field} selected={row.differs}>
              <TableCell>{row.label}</TableCell>
              <TableCell>{row.mis}</TableCell>
              <TableCell>{row.differs ? <strong>{row.applied}</strong> : row.applied}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!submission.comparison.some((row) => row.differs) && (
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage("koboSubmissions.comparison.nowSame")}
          </Typography>
        </Box>
      )}
      {submission.individualId && (
        <Box mt={1}>
          <Link to={`/${modulesManager.getRef("individual.route.individual")}/${submission.individualId}`}>
            {formatMessage("koboSubmissions.openRecord")}
          </Link>
        </Box>
      )}
    </Box>
  );
}

function SubmissionRow({ submission, formatMessage, formatDateTimeFromISO, modulesManager }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const canCompare = !!submission.comparison?.length;
  return (
    <>
      <TableRow>
        <TableCell padding="checkbox">
          {canCompare && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>{submission.koboId}</TableCell>
        <TableCell>{submission.submittedAt ? formatDateTimeFromISO(submission.submittedAt) : ""}</TableCell>
        <TableCell>
          {submission.individualId ? (
            <Link to={`/${modulesManager.getRef("individual.route.individual")}/${submission.individualId}`}>
              {`${submission.firstName} ${submission.lastName}`}
            </Link>
          ) : (
            `${submission.firstName} ${submission.lastName}`
          )}
        </TableCell>
        <TableCell>{submission.nationalId}</TableCell>
        <TableCell>
          <Chip
            size="small"
            label={formatMessage(`koboSubmissions.status.${submission.status}`)}
            color={STATUS_COLOR[submission.status] || "default"}
          />
        </TableCell>
        <TableCell>{`${submission.documentsStored} / ${submission.documents}`}</TableCell>
        <TableCell>{submission.reason}</TableCell>
      </TableRow>
      {canCompare && (
        <TableRow>
          <TableCell colSpan={8} className={classes.detailsCell}>
            <Collapse in={open} unmountOnExit>
              <Comparison submission={submission} formatMessage={formatMessage} modulesManager={modulesManager} />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function KoboSubmissionsTab() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues, formatDateTimeFromISO } = useTranslations(
    MSR_ETL_MODULE_NAME,
    modulesManager,
  );
  // Held first: they are the ones waiting for someone
  const [status, setStatus] = useState("HELD");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { isLoading, data, error } = useGraphqlQuery(
    SUBMISSIONS_QUERY,
    { status: status || null, search: search || null, first: pageSize, offset: page * pageSize },
    { keepStale: true },
  );
  const result = data?.koboSubmissions;
  const submissions = result?.items || [];
  const summary = result?.summary || { submissions: {}, documents: {} };
  const chooseStatus = (value) => {
    setStatus(value);
    setPage(0);
  };
  const applySearch = () => {
    setSearch(searchText.trim());
    setPage(0);
  };

  return (
    <Box p={2}>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={1}>
        <Box mr={1}>
          <Typography variant="subtitle2">{formatMessage("koboSubmissions.summary.submissions")}</Typography>
        </Box>
        {SUBMISSION_STATUSES.map((value) => (
          <Box key={value} mr={1} mb={1}>
            <Chip
              size="small"
              clickable
              color={status === value ? "primary" : "default"}
              onClick={() => chooseStatus(status === value ? "" : value)}
              label={`${formatMessage(`koboSubmissions.status.${value}`)}: ${summary.submissions[value] ?? 0}`}
            />
          </Box>
        ))}
      </Box>
      <Box display="flex" flexWrap="wrap" alignItems="center" mb={2}>
        <Box mr={1}>
          <Typography variant="subtitle2">{formatMessage("koboSubmissions.summary.documents")}</Typography>
        </Box>
        {DOCUMENT_STATUSES.map((value) => (
          <Box key={value} mr={1} mb={1}>
            <Chip
              size="small"
              variant="outlined"
              label={`${formatMessage(`applicantDocuments.status.${value}`)}: ${summary.documents[value] ?? 0}`}
            />
          </Box>
        ))}
      </Box>
      <Box display="flex" flexWrap="wrap" mb={2}>
        <Box className={classes.statusFilter}>
          <TextField
            select
            fullWidth
            label={formatMessage("koboSubmissions.filter.status")}
            value={status}
            onChange={(event) => chooseStatus(event.target.value)}
          >
            <MenuItem value="">{formatMessage("koboSubmissions.filter.all")}</MenuItem>
            {SUBMISSION_STATUSES.map((value) => (
              <MenuItem key={value} value={value}>
                {formatMessage(`koboSubmissions.status.${value}`)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box className={classes.searchFilter}>
          <TextField
            fullWidth
            label={formatMessage("koboSubmissions.filter.search")}
            helperText={formatMessage("koboSubmissions.filter.searchHelp")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && applySearch()}
            onBlur={applySearch}
          />
        </Box>
      </Box>
      {isLoading && !result && <Typography variant="body2">{formatMessage("koboSubmissions.loading")}</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          {formatMessage("koboSubmissions.error")}
        </Typography>
      )}
      {result && !submissions.length && (
        <Typography variant="body2" color="textSecondary">
          {formatMessage("koboSubmissions.none")}
        </Typography>
      )}
      {!!submissions.length && (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{formatMessage("koboSubmissions.koboId")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.submittedAt")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.name")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.nationalId")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.status")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.documents")}</TableCell>
                <TableCell>{formatMessage("koboSubmissions.reason")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  formatMessage={formatMessage}
                  formatDateTimeFromISO={formatDateTimeFromISO}
                  modulesManager={modulesManager}
                />
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={result.totalCount}
            page={page}
            rowsPerPage={pageSize}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onChangePage={(event, value) => setPage(value)}
            onChangeRowsPerPage={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
            labelDisplayedRows={({ from, to, count }) =>
              formatMessageWithValues("koboSubmissions.pageRows", { from, to, count })
            }
          />
        </>
      )}
    </Box>
  );
}

export default KoboSubmissionsTab;
