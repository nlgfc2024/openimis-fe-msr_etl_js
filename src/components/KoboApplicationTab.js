import React, { useState } from "react";
import { Box, Divider, FormLabel, Grid, MenuItem, Paper, Tab, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  ProgressOrError,
  PublishedComponent,
  formatDateTimeFromISO,
  useGraphqlQuery,
  useModulesManager,
  useTranslations,
} from "@openimis/fe-core";
import { useIntl } from "react-intl";

import { MSR_ETL_MODULE_NAME } from "../constants";
import { cameFromKobo } from "../util/kobo";

const KOBO_APPLICATION_TAB_VALUE = "msrEtlKoboApplicationTab";

const APPLICATIONS_QUERY = `query MsrEtlKoboApplications($individualId: UUID!) {
  koboApplications(individualId: $individualId) {
    id koboId status reason submittedAt formVersion sections
  }
}`;

function KoboApplicationTabLabel({ onChange, tabStyle, isSelected, individual }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  if (!individual || !cameFromKobo(individual)) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(KOBO_APPLICATION_TAB_VALUE)}
      selected={isSelected(KOBO_APPLICATION_TAB_VALUE)}
      value={KOBO_APPLICATION_TAB_VALUE}
      label={formatMessage("koboApplication.tab")}
    />
  );
}

// The openIMIS read-only panel: a title band (theme.table.title) over a grid of read-only fields
const useStyles = makeStyles((theme) => ({
  panel: { marginBottom: theme.spacing(2) },
  band: { ...theme.table.title, padding: theme.spacing(1, 2) },
  item: theme.paper.item,
  // A question label wraps above its answer; answers in a row line up on their underline
  field: { display: "flex", flexDirection: "column", height: "100%" },
  label: { fontSize: "0.75rem", lineHeight: 1.4, marginBottom: theme.spacing(0.5) },
  value: {
    marginTop: "auto",
    padding: theme.spacing(0.5, 0),
    borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    color: theme.palette.text.primary,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
}));

// Answers longer than this take the whole row
const LONG_ANSWER = 60;
const EMPTY = "\u2014";

function ReadOnlyField({ label, value, classes }) {
  const text = value === null || value === undefined || value === "" ? EMPTY : String(value);
  const long = text.length > LONG_ANSWER || text.includes("\n");
  return (
    <Grid item xs={12} sm={long ? 12 : 6} md={long ? 12 : 4} className={classes.item}>
      <div className={classes.field}>
        <FormLabel component="div" className={classes.label}>
          {label}
        </FormLabel>
        <Typography variant="body1" className={classes.value}>
          {text}
        </Typography>
      </div>
    </Grid>
  );
}

function Panel({ title, children, classes }) {
  return (
    <Paper variant="outlined" className={classes.panel}>
      <Box className={classes.band}>
        <Typography>{title}</Typography>
      </Box>
      <Divider />
      <Grid container className={classes.item}>
        {children}
      </Grid>
    </Paper>
  );
}

function Application({ application, applications, onSelect, formatMessage, formatMessageWithValues }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const intl = useIntl();
  const submitted = (a) => (a.submittedAt ? formatDateTimeFromISO(modulesManager, intl, a.submittedAt) : EMPTY);
  return (
    <>
      <Panel title={formatMessage("koboApplication.summary")} classes={classes}>
        {applications.length > 1 && (
          <Grid item xs={12} className={classes.item}>
            <TextField
              select
              fullWidth
              label={formatMessage("koboApplication.choose")}
              value={application.id}
              onChange={(e) => onSelect(e.target.value)}
            >
              {applications.map((a, index) => (
                <MenuItem key={a.id} value={a.id}>
                  {formatMessageWithValues(index ? "koboApplication.earlier" : "koboApplication.latest", {
                    date: submitted(a),
                    kobo: a.koboId,
                  })}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        <ReadOnlyField
          classes={classes}
          label={formatMessage("koboApplication.submittedOn")}
          value={submitted(application)}
        />
        <ReadOnlyField classes={classes} label={formatMessage("koboApplication.koboId")} value={application.koboId} />
        <ReadOnlyField
          classes={classes}
          label={formatMessage("koboApplication.formVersion")}
          value={application.formVersion}
        />
        <ReadOnlyField
          classes={classes}
          label={formatMessage("koboApplication.outcome")}
          value={formatMessage(`koboApplication.status.${application.status}`)}
        />
        {application.reason && (
          <ReadOnlyField
            classes={classes}
            label={formatMessage("koboApplication.reason")}
            value={application.reason}
          />
        )}
      </Panel>
      {!application.sections?.length && (
        <Typography variant="body2">{formatMessage("koboApplication.noForm")}</Typography>
      )}
      {(application.sections || []).map((section, index) => (
        // Ungrouped questions share a blank label, so the position keeps keys unique
        <Panel
          key={`${index}-${section.label}`}
          title={section.label || formatMessage("koboApplication.otherAnswers")}
          classes={classes}
        >
          {section.fields.map((field) => (
            <ReadOnlyField key={field.name} classes={classes} label={field.label} value={field.value} />
          ))}
        </Panel>
      ))}
    </>
  );
}

/** An individual's Kobo applications, newest first; also published as the msrEtl.KoboApplications ref. */
function KoboApplications({ individualId, skip = false }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const { isLoading, data, error } = useGraphqlQuery(
    APPLICATIONS_QUERY,
    { individualId },
    { skip: skip || !individualId },
  );
  const [selected, setSelected] = useState(null);
  const applications = data?.koboApplications || [];
  // Newest first from the backend; the officer can switch to an earlier application
  const shown = applications.find((a) => a.id === selected) || applications[0];
  return (
    <>
      <ProgressOrError progress={isLoading} error={error && formatMessage("koboApplication.error")} />
      {!isLoading && !error && !applications.length && (
        <Typography variant="body2">{formatMessage("koboApplication.none")}</Typography>
      )}
      {shown && (
        <Application
          application={shown}
          applications={applications}
          onSelect={setSelected}
          formatMessage={formatMessage}
          formatMessageWithValues={formatMessageWithValues}
        />
      )}
    </>
  );
}

function KoboApplicationTabPanel({ value, individual }) {
  if (!individual || !cameFromKobo(individual)) return null;
  return (
    <PublishedComponent pubRef="policyHolder.TabPanel" module="individual" index={KOBO_APPLICATION_TAB_VALUE} value={value}>
      <Box p={2}>
        {/* Fetched only while the tab is open */}
        <KoboApplications individualId={individual.id} skip={value !== KOBO_APPLICATION_TAB_VALUE} />
      </Box>
    </PublishedComponent>
  );
}

export { KoboApplications, KoboApplicationTabLabel, KoboApplicationTabPanel };
