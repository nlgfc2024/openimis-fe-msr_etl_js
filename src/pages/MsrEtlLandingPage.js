import React, { useState } from "react";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Tab } from "@material-ui/core";
import { Helmet, useModulesManager, useTranslations, withModulesManager } from "@openimis/fe-core";
import { injectIntl } from "react-intl";

import { MSR_ETL_MODULE_NAME, RIGHT_MSR_ETL_SEARCH } from "../constants";
import LocationImportTab from "./tabs/LocationImportTab";
import IndividualsImportTab from "./tabs/IndividualsImportTab";
import MsrEtlLogsTab from "./tabs/MsrEtlLogsTab";

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: {
    display: "flex",
    alignItems: "center",
  },
  selectedTab: {
    borderBottom: "4px solid white",
  },
  unselectedTab: {
    borderBottom: "4px solid transparent",
  },
  tabContent: {
    paddingBottom: theme.spacing(0.5),
  },
});

const TAB = {
  LOCATION: 0,
  INDIVIDUALS: 1,
  LOGS: 2,
};

function MsrEtlLandingPage({ classes, rights }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const [activeTab, setActiveTab] = useState(TAB.LOCATION);

  if (!rights.includes(RIGHT_MSR_ETL_SEARCH)) {
    return null;
  }

  const isSelected = (tab) => tab === activeTab;
  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);
  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage("landing.pageTitle")} />
      <Paper className={classes.paper}>
        <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
          <Tab
            onChange={handleChange}
            className={tabStyle(TAB.LOCATION)}
            selected={isSelected(TAB.LOCATION)}
            value={TAB.LOCATION}
            label={formatMessage("landing.tab.location")}
          />
          <Tab
            onChange={handleChange}
            className={tabStyle(TAB.INDIVIDUALS)}
            selected={isSelected(TAB.INDIVIDUALS)}
            value={TAB.INDIVIDUALS}
            label={formatMessage("landing.tab.individuals")}
          />
          <Tab
            onChange={handleChange}
            className={tabStyle(TAB.LOGS)}
            selected={isSelected(TAB.LOGS)}
            value={TAB.LOGS}
            label={formatMessage("landing.tab.logs")}
          />
        </Grid>
        <div className={classes.tabContent}>
          {activeTab === TAB.LOCATION && <LocationImportTab rights={rights} />}
          {activeTab === TAB.INDIVIDUALS && <IndividualsImportTab rights={rights} />}
          {activeTab === TAB.LOGS && <MsrEtlLogsTab rights={rights} />}
        </div>
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(MsrEtlLandingPage)))),
);
