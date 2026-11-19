import React from "react";
import { Tab, Box, Grid, Typography, Divider, Chip } from "@material-ui/core";
import { PublishedComponent, useGraphqlQuery, useModulesManager, useTranslations } from "@openimis/fe-core";

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

function Application({ application, formatMessage, formatMessageWithValues }) {
  return (
    <Box mb={3}>
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="h6">
          {formatMessageWithValues("koboApplication.submitted", {
            date: application.submittedAt ? new Date(application.submittedAt).toLocaleString() : "-",
            version: application.formVersion || "-",
          })}
        </Typography>
        <Box ml={1.5}>
          <Chip size="small" label={formatMessage(`koboApplication.status.${application.status}`)} />
        </Box>
      </Box>
      {application.reason && (
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {application.reason}
        </Typography>
      )}
      {!application.sections?.length && (
        <Typography variant="body2">{formatMessage("koboApplication.noForm")}</Typography>
      )}
      {(application.sections || []).map((section, index) => (
        // Ungrouped questions share a blank label, so the position keeps keys unique
        <Box key={`${index}-${section.label}`} mt={2}>
          {section.label && <Typography variant="subtitle1">{section.label}</Typography>}
          <Divider />
          <Box mt={0.5}>
            <Grid container spacing={1}>
              {section.fields.map((field) => (
                <Grid item xs={12} md={6} key={field.name}>
                  <Typography variant="caption" color="textSecondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                    {field.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function KoboApplicationTabPanel({ value, individual }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const show = !!individual && cameFromKobo(individual);
  // Fetched only while the tab is open
  const { isLoading, data, error } = useGraphqlQuery(
    APPLICATIONS_QUERY,
    { individualId: individual?.id },
    { skip: !show || value !== KOBO_APPLICATION_TAB_VALUE },
  );
  if (!show) return null;
  const applications = data?.koboApplications || [];
  return (
    <PublishedComponent pubRef="policyHolder.TabPanel" module="individual" index={KOBO_APPLICATION_TAB_VALUE} value={value}>
      <Box p={2}>
        {isLoading && <Typography variant="body2">{formatMessage("koboApplication.loading")}</Typography>}
        {error && (
          <Typography variant="body2" color="error">
            {formatMessage("koboApplication.error")}
          </Typography>
        )}
        {!isLoading && !error && !applications.length && (
          <Typography variant="body2">{formatMessage("koboApplication.none")}</Typography>
        )}
        {applications.map((application) => (
          <Application
            key={application.id}
            application={application}
            formatMessage={formatMessage}
            formatMessageWithValues={formatMessageWithValues}
          />
        ))}
      </Box>
    </PublishedComponent>
  );
}

export { KoboApplicationTabLabel, KoboApplicationTabPanel };
