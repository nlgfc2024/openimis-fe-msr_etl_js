import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import { apiHeaders, baseApiUrl, useModulesManager, useTranslations } from "@openimis/fe-core";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { createUploadTracker } from "../util/uploadTracker";

const ACCEPTED_FILES = ".xlsx,.xls,.csv";

// A file of form numbers (e.g. UPG's SCTP export), uploaded on selection; the field's value is the upload_id
const FormNumberFileField = ({ label, value, onChange, readOnly, required, sourceType }) => {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const tracker = useRef(null);
  if (!tracker.current) tracker.current = createUploadTracker();
  // The latest onChange: one captured at upload start would write back the form as it was then
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const written = useRef({ value, sourceType });

  const write = (next) => {
    written.current = { value: next, sourceType };
    onChangeRef.current(next);
  };

  // A programme change or Clear resets the value from outside: drop any pending upload with it
  useEffect(() => {
    if (value === written.current.value && sourceType === written.current.sourceType) return;
    written.current = { value, sourceType };
    tracker.current.cancel();
    setUploading(false);
    setSummary(null);
    setError(null);
  }, [value, sourceType]);

  useEffect(() => () => tracker.current.cancel(), []);

  const upload = async (file) => {
    if (!file) return;
    const request = tracker.current.start();
    setUploading(true);
    setSummary(null);
    setError(null);
    // Drop the previous file's upload_id, so Pull Data can't import it while this one uploads
    write(null);
    const body = new FormData();
    body.append("file", file);
    body.append("source_type", sourceType);
    try {
      // Only the CSRF token: the browser sets the multipart Content-Type itself
      const response = await fetch(`${baseApiUrl}/msr_etl/form_number_upload/`, {
        method: "POST",
        body,
        headers: { "X-CSRFToken": apiHeaders()["X-CSRFToken"] },
        credentials: "same-origin",
        signal: request.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!request.isCurrent()) return;
      if (!response.ok || !result.success) {
        throw new Error(result.error || formatMessage("formNumberFile.uploadFailed"));
      }
      setSummary({ ...result, fileName: file.name });
      write(result.upload_id);
    } catch (e) {
      if (!request.isCurrent()) return;
      setError(e.message);
    } finally {
      if (request.isCurrent()) setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const firstRejected = summary?.rejected_rows?.[0];
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
        {required ? " *" : ""}
      </Typography>
      <Box display="flex" alignItems="center" style={{ gap: 12 }} mt={0.5}>
        <input ref={input} type="file" accept={ACCEPTED_FILES} hidden onChange={(e) => upload(e.target.files[0])} />
        <Button
          variant="outlined"
          size="small"
          disabled={readOnly || uploading || !sourceType}
          onClick={() => input.current?.click()}
        >
          {formatMessage(value ? "formNumberFile.replace" : "formNumberFile.choose")}
        </Button>
        {uploading && <CircularProgress size={18} />}
        {!uploading && summary && (
          <Typography variant="body2">
            {formatMessageWithValues("formNumberFile.summary", {
              fileName: summary.fileName,
              households: summary.households,
              duplicates: summary.duplicates,
              rejected: summary.rejected,
            })}
          </Typography>
        )}
        {!uploading && !summary && value && (
          <Typography variant="body2">{formatMessage("formNumberFile.uploaded")}</Typography>
        )}
      </Box>
      {!uploading && firstRejected && (
        <Typography variant="caption" color="textSecondary">
          {formatMessageWithValues("formNumberFile.rejectedExample", firstRejected)}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FormNumberFileField;
