import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@material-ui/core";
import { baseApiUrl, useModulesManager, useTranslations } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { previewKind } from "../util/kobo";

// Loads a document with the user's session and keeps it as a local object URL, so it is shown in the page
function useDocumentFile(document, enabled) {
  const [file, setFile] = useState({ url: null, error: false, loading: false });
  useEffect(() => {
    if (!document || !enabled) {
      setFile({ url: null, error: false, loading: false });
      return undefined;
    }
    const controller = new AbortController();
    let url = null;
    setFile({ url: null, error: false, loading: true });
    fetch(`${baseApiUrl}/${document.url}`, { credentials: "same-origin", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setFile({ url, error: false, loading: false });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFile({ url: null, error: true, loading: false });
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [document?.id, enabled]);
  return file;
}

// A spreadsheet's sheets as rows, read by the MIS from the stored file
function useDocumentTable(document) {
  const [table, setTable] = useState({ sheets: null, error: false, loading: false });
  useEffect(() => {
    if (!document?.tableUrl) {
      setTable({ sheets: null, error: false, loading: false });
      return undefined;
    }
    const controller = new AbortController();
    setTable({ sheets: null, error: false, loading: true });
    fetch(`${baseApiUrl}/${document.tableUrl}`, { credentials: "same-origin", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json();
      })
      .then((data) => setTable({ sheets: data.sheets || [], error: false, loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError") setTable({ sheets: null, error: true, loading: false });
      });
    return () => controller.abort();
  }, [document?.id]);
  return table;
}

// Fetches the original file and saves it, for files shown as a table or not shown at all
async function downloadDocument(document) {
  const response = await fetch(`${baseApiUrl}/${document.url}`, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`${response.status}`);
  const url = URL.createObjectURL(await response.blob());
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.filename || "document";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function SheetTable({ sheet, formatMessage }) {
  if (!sheet.rows.length)
    return <Typography variant="body2">{formatMessage("applicantDocuments.viewer.emptySheet")}</Typography>;
  return (
    <>
      <Table size="small">
        <TableBody>
          {sheet.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((value, columnIndex) => (
                <TableCell key={columnIndex} style={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sheet.truncated && (
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage("applicantDocuments.viewer.truncated")}
          </Typography>
        </Box>
      )}
    </>
  );
}

function ApplicantDocumentViewer({ documents, index, onIndexChange, onClose }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const document = index === null ? null : documents[index];
  const kind = document ? previewKind(document.mimetype) : null;
  const file = useDocumentFile(document, !!kind);
  const table = useDocumentTable(document);
  useEffect(() => {
    setSheetIndex(0);
    setDownloadFailed(false);
  }, [document?.id]);
  if (!document) return null;

  const loading = file.loading || table.loading;
  const failed = file.error || table.error || downloadFailed;
  const sheets = table.sheets || [];
  const download = () => {
    setDownloadFailed(false);
    if (file.url) {
      const link = window.document.createElement("a");
      link.href = file.url;
      link.download = document.filename || "document";
      link.click();
    } else {
      downloadDocument(document).catch(() => setDownloadFailed(true));
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle disableTypography>
        <Typography variant="h6">{document.label}</Typography>
        <Typography variant="body2" color="textSecondary">
          {formatMessageWithValues("applicantDocuments.viewer.position", {
            current: index + 1,
            total: documents.length,
          })}
          {" · "}
          {document.filename}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {sheets.length > 1 && (
          <Tabs value={sheetIndex} onChange={(event, value) => setSheetIndex(value)} indicatorColor="primary">
            {sheets.map((sheet, i) => (
              <Tab key={i} value={i} label={sheet.name} />
            ))}
          </Tabs>
        )}
        <Box
          height="70vh"
          display="flex"
          alignItems={sheets.length ? "flex-start" : "center"}
          justifyContent={sheets.length ? "flex-start" : "center"}
          overflow="auto"
        >
          {loading && <Typography variant="body2">{formatMessage("applicantDocuments.viewer.loading")}</Typography>}
          {failed && (
            <Typography variant="body2" color="error">
              {formatMessage("applicantDocuments.viewer.error")}
            </Typography>
          )}
          {file.url && kind === "pdf" && (
            <iframe title={document.filename} src={file.url} style={{ width: "100%", height: "100%", border: 0 }} />
          )}
          {file.url && kind === "image" && (
            <img src={file.url} alt={document.label} style={{ maxWidth: "100%", maxHeight: "100%" }} />
          )}
          {!!sheets.length && <SheetTable sheet={sheets[sheetIndex] || sheets[0]} formatMessage={formatMessage} />}
          {table.sheets && !sheets.length && (
            <Typography variant="body2">{formatMessage("applicantDocuments.viewer.emptySheet")}</Typography>
          )}
          {!kind && !document.tableUrl && !failed && (
            <Typography variant="body2">{formatMessage("applicantDocuments.viewer.noPreview")}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={index === 0} onClick={() => onIndexChange(index - 1)}>
          {formatMessage("applicantDocuments.viewer.previous")}
        </Button>
        <Button disabled={index === documents.length - 1} onClick={() => onIndexChange(index + 1)}>
          {formatMessage("applicantDocuments.viewer.next")}
        </Button>
        <Box flexGrow={1} />
        <Button disabled={!!kind && !file.url} onClick={download}>
          {formatMessage("applicantDocuments.viewer.download")}
        </Button>
        <Button color="primary" onClick={onClose}>
          {formatMessage("applicantDocuments.viewer.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApplicantDocumentViewer;
