import React, { useState } from "react";
import { Tab, Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PublishedComponent, useGraphqlQuery, useModulesManager, useTranslations } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { cameFromKobo, formatFileSize } from "../util/kobo";
import ApplicantDocumentViewer from "./ApplicantDocumentViewer";

const DOCUMENTS_TAB_VALUE = "msrEtlApplicantDocumentsTab";

const DOCUMENTS_QUERY = `query MsrEtlApplicantDocuments($individualId: UUID!) {
  applicantDocuments(individualId: $individualId) {
    id koboId documentType label filename mimetype size status storedAt url tableUrl canOpen
  }
}`;

function ApplicantDocumentsTabLabel({ onChange, tabStyle, isSelected, individual }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  if (!individual || !cameFromKobo(individual)) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(DOCUMENTS_TAB_VALUE)}
      selected={isSelected(DOCUMENTS_TAB_VALUE)}
      value={DOCUMENTS_TAB_VALUE}
      label={formatMessage("applicantDocuments.tab")}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  filename: { whiteSpace: "nowrap" },
  actions: { whiteSpace: "nowrap", "& > *:not(:first-child)": { marginLeft: theme.spacing(1) } },
}));

/** An individual's documents with the viewer; also published as the msrEtl.ApplicantDocuments ref. Other modules
 * extend it with columns [{key, header, render(document)}], rowActions(document, open), viewerActions(document) and
 * rowHighlighted(document); compact shows size and status under the file name. */
function ApplicantDocuments({
  individualId,
  skip = false,
  compact = false,
  columns = [],
  rowActions,
  viewerActions,
  rowHighlighted,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const [viewing, setViewing] = useState(null);
  const { isLoading, data, error } = useGraphqlQuery(
    DOCUMENTS_QUERY,
    { individualId },
    { skip: skip || !individualId },
  );
  const documents = data?.applicantDocuments || [];
  // The viewer steps through the documents this user can open
  const openable = documents.filter((document) => document.canOpen && document.url);
  return (
    <>
      {isLoading && <Typography variant="body2">{formatMessage("applicantDocuments.loading")}</Typography>}
      {error && (
        <Typography variant="body2" color="error">
          {formatMessage("applicantDocuments.error")}
        </Typography>
      )}
      {!isLoading && !error && !documents.length && (
        <Typography variant="body2">{formatMessage("applicantDocuments.none")}</Typography>
      )}
      {!!documents.length && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage("applicantDocuments.document")}</TableCell>
              <TableCell>{formatMessage("applicantDocuments.file")}</TableCell>
              {!compact && <TableCell>{formatMessage("applicantDocuments.size")}</TableCell>}
              {!compact && <TableCell>{formatMessage("applicantDocuments.status")}</TableCell>}
              {columns.map((column) => (
                <TableCell key={column.key}>{column.header}</TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id} selected={!!rowHighlighted?.(document)}>
                <TableCell>{document.label}</TableCell>
                {compact ? (
                  <TableCell>
                    <Typography variant="body2" className={classes.filename}>
                      {document.filename}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {`${formatFileSize(document.size)} · ${formatMessage(`applicantDocuments.status.${document.status}`)}`}
                    </Typography>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>{document.filename}</TableCell>
                    <TableCell>{formatFileSize(document.size)}</TableCell>
                    <TableCell>{formatMessage(`applicantDocuments.status.${document.status}`)}</TableCell>
                  </>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(document)}</TableCell>
                ))}
                <TableCell align="right" className={classes.actions}>
                  {openable.includes(document) && (
                    <Button size="small" color="primary" onClick={() => setViewing(openable.indexOf(document))}>
                      {formatMessage("applicantDocuments.view")}
                    </Button>
                  )}
                  {rowActions?.(document, openable.includes(document) ? () => setViewing(openable.indexOf(document)) : null)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <ApplicantDocumentViewer
        documents={openable}
        index={viewing}
        onIndexChange={setViewing}
        onClose={() => setViewing(null)}
        actions={viewerActions}
      />
    </>
  );
}

function ApplicantDocumentsTabPanel({ value, individual }) {
  if (!individual || !cameFromKobo(individual)) return null;
  return (
    <PublishedComponent pubRef="policyHolder.TabPanel" module="individual" index={DOCUMENTS_TAB_VALUE} value={value}>
      <Box p={2}>
        {/* Fetched only while the tab is open */}
        <ApplicantDocuments individualId={individual.id} skip={value !== DOCUMENTS_TAB_VALUE} />
      </Box>
    </PublishedComponent>
  );
}

export { ApplicantDocuments, ApplicantDocumentsTabLabel, ApplicantDocumentsTabPanel };
