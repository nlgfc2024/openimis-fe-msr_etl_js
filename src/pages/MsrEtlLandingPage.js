import React, { useState } from "react";
import { connect, useSelector } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Tab } from "@material-ui/core";
import {
  Helmet,
  useHistory,
  useModulesManager,
  useParams,
  useTranslations,
  withModulesManager,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";

import { MSR_ETL_MODULE_NAME, MSR_ETL_TAB, MSR_ETL_TAB_SLUGS, RIGHT_MSR_ETL_SEARCH } from "../constants";
import LocationImportTab from "./tabs/LocationImportTab";
import IndividualsImportTab from "./tabs/IndividualsImportTab";
import MsrEtlLogsTab from "./tabs/MsrEtlLogsTab";

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  alertSlot: {
    marginLeft: theme.paper.paper.margin - theme.spacing(1),
    marginRight: theme.paper.paper.margin - theme.spacing(1),
  },
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

function MsrEtlLandingPage({ classes, rights }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const history = useHistory();
  const { tab } = useParams();
  const activeTab = Math.max(MSR_ETL_TAB_SLUGS.indexOf(tab), MSR_ETL_TAB.LOCATION);
  const [alertSlot, setAlertSlot] = useState(null);
  const onlySourceLabel = (sourceTypes) => (sourceTypes.length === 1 ? sourceTypes[0].sourceName : undefined);
  const locationSource = useSelector((state) => onlySourceLabel(state.msrEtl.locationSourceTypes));
  const individualSource = useSelector((state) => onlySourceLabel(state.msrEtl.individualSourceTypes));
  const titleSource = {
    [MSR_ETL_TAB.LOCATION]: locationSource && ["landing.title.location", locationSource],
    [MSR_ETL_TAB.INDIVIDUALS]: individualSource && ["landing.title.individuals", individualSource],
  }[activeTab];
  const pageTitle = titleSource
    ? formatMessageWithValues(titleSource[0], { source: titleSource[1] })
    : formatMessage("landing.pageTitle");

  if (!rights.includes(RIGHT_MSR_ETL_SEARCH)) {
    return null;
  }

  const isSelected = (tab) => tab === activeTab;
  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);
  const handleChange = (_, value) =>
    history.replace(`/${modulesManager.getRef(`${MSR_ETL_MODULE_NAME}.route.landing`)}/${MSR_ETL_TAB_SLUGS[value]}`);

  return (
    <div className={classes.page}>
      <div ref={setAlertSlot} className={classes.alertSlot} />
      <Helmet title={pageTitle} />
      <Paper className={classes.paper}>
        <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
          <Tab
            onChange={handleChange}
            className={tabStyle(MSR_ETL_TAB.LOCATION)}
            selected={isSelected(MSR_ETL_TAB.LOCATION)}
            value={MSR_ETL_TAB.LOCATION}
            label={formatMessage("landing.tab.location")}
          />
          <Tab
            onChange={handleChange}
            className={tabStyle(MSR_ETL_TAB.INDIVIDUALS)}
            selected={isSelected(MSR_ETL_TAB.INDIVIDUALS)}
            value={MSR_ETL_TAB.INDIVIDUALS}
            label={formatMessage("landing.tab.individuals")}
          />
          <Tab
            onChange={handleChange}
            className={tabStyle(MSR_ETL_TAB.LOGS)}
            selected={isSelected(MSR_ETL_TAB.LOGS)}
            value={MSR_ETL_TAB.LOGS}
            label={formatMessage("landing.tab.logs")}
          />
        </Grid>
        <div className={classes.tabContent}>
          {activeTab === MSR_ETL_TAB.LOCATION && <LocationImportTab rights={rights} alertSlot={alertSlot} />}
          {activeTab === MSR_ETL_TAB.INDIVIDUALS && <IndividualsImportTab rights={rights} alertSlot={alertSlot} />}
          {activeTab === MSR_ETL_TAB.LOGS && <MsrEtlLogsTab rights={rights} />}
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
