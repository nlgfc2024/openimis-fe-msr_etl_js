import React, { useState, useEffect } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Box, Button } from "@material-ui/core";
import {
  useHistory,
  useModulesManager,
  useTranslations,
  formatMessageWithValues,
  Form,
  ProgressOrError,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { makeStyles } from "@material-ui/styles";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { MSR_ETL_MODULE_NAME, MSR_ETL_SERVICES } from "../constants";
import HouseholdFiltersPanel from "../components/HouseholdFiltersPanel";
import LocationFiltersPanel from "../components/LocationFiltersPanel";
import {
  executeMsrUbrIndividualsImport,
  clearMsrEtlExecution,
  fetchMsrUbrLocations,
  clearMsrUbrLocations,
} from "../actions";
import { normalizeLocationSelection } from "../util/location";

const SERVICE_KIND = {
  INDIVIDUAL: "individual",
  LOCATION: "location",
};

function getServiceKind(serviceName) {
  const normalized = String(serviceName || "")
    .trim()
    .toLowerCase();

  if (normalized === MSR_ETL_SERVICES.UBR_LOCATION_SERVICE.toLowerCase()) {
    return SERVICE_KIND.LOCATION;
  }

  if (normalized === MSR_ETL_SERVICES.UBR_INDIVIDUAL_SERVICE.toLowerCase()) {
    return SERVICE_KIND.INDIVIDUAL;
  }

  // Be tolerant to backend naming variants and prefer location by default.
  if (normalized.includes("location")) {
    return SERVICE_KIND.LOCATION;
  }

  if (normalized.includes("individual")) {
    return SERVICE_KIND.INDIVIDUAL;
  }

  return SERVICE_KIND.LOCATION;
}

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  actions: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

function loadSavedFilters(serviceName) {
  try {
    const raw = localStorage.getItem(`${MSR_ETL_MODULE_NAME}_filters_${serviceName}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function MsrEtlFiltersPage({
  match,
  intl,
  rights,
  executingUbrIndividualsImport,
  errorUbrIndividualsImport,
  fetchingMsrUbrLocations,
  errorMsrUbrLocations,
  executeMsrUbrIndividualsImport,
  clearMsrEtlExecution,
  fetchMsrUbrLocations,
  clearMsrUbrLocations,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const serviceName = match?.params?.service_name ?? "";
  const serviceKind = getServiceKind(serviceName);

  const [edited, setEdited] = useState(() => loadSavedFilters(serviceName) || {});
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const saved = loadSavedFilters(serviceName);
    if (saved) setEdited(saved);
    setReset((prev) => prev + 1);
    clearMsrEtlExecution();
    clearMsrUbrLocations();
  }, [serviceName]);

  const pageTitle = formatMessageWithValues(intl, MSR_ETL_MODULE_NAME, "filters.pageTitle", { service: serviceName });

  const back = () => history.goBack();

  const save = (data) => {
    if (data) {
      localStorage.setItem(`${MSR_ETL_MODULE_NAME}_filters_${serviceName}`, JSON.stringify(data));
    }
  };

  const renderFilterPanel = () => {
    if (serviceKind === SERVICE_KIND.INDIVIDUAL) return HouseholdFiltersPanel;
    if (serviceKind === SERVICE_KIND.LOCATION) return LocationFiltersPanel;
    return null;
  };

  const onPullData = () => {
    save(edited);
    if (serviceKind === SERVICE_KIND.LOCATION) return fetchMsrUbrLocations({ ...edited });
    return executeMsrUbrIndividualsImport(edited);
  };

  const fetching = serviceKind === SERVICE_KIND.LOCATION ? fetchingMsrUbrLocations : executingUbrIndividualsImport;

  const error = serviceKind === SERVICE_KIND.LOCATION ? errorMsrUbrLocations : errorUbrIndividualsImport;
  const normalizedLocation = normalizeLocationSelection(edited.location);
  const mandatoryFieldsEmpty =
    serviceKind === SERVICE_KIND.INDIVIDUAL && (!normalizedLocation.district || !normalizedLocation.ta);

  const filterPanel = renderFilterPanel();

  if (!filterPanel) {
    return (
      <div className={classes.page}>
        <Form module={MSR_ETL_MODULE_NAME} back={back} title={pageTitle} />
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <Form
        module={MSR_ETL_MODULE_NAME}
        back={back}
        save={save}
        title={pageTitle}
        edited={edited}
        onEditedChanged={setEdited}
        reset={reset}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={() => !mandatoryFieldsEmpty}
        HeadPanel={filterPanel}
        actions={[]}
        rights={rights}
      />
      <Box className={classes.actions}>
        <Button variant="contained" color="primary" onClick={onPullData} disabled={fetching || mandatoryFieldsEmpty}>
          {formatMessage("filters.pullData")}
        </Button>
        <Button variant="outlined" onClick={back}>
          {formatMessage("dialog.cancel")}
        </Button>
      </Box>

      <ProgressOrError progress={fetching} error={error} />
    </div>
  );
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      executeMsrUbrIndividualsImport,
      clearMsrEtlExecution,
      fetchMsrUbrLocations,
      clearMsrUbrLocations,
    },
    dispatch,
  );

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  executingUbrIndividualsImport: state.msrEtl.executingUbrIndividualsImport,
  errorUbrIndividualsImport: state.msrEtl.errorUbrIndividualsImport,
  fetchingMsrUbrLocations: state.msrEtl.fetchingMsrUbrLocations,
  errorMsrUbrLocations: state.msrEtl.errorMsrUbrLocations,
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MsrEtlFiltersPage));
