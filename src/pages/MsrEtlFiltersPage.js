import React, { useState, useEffect } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Paper,
} from '@material-ui/core';
import {
  Helmet,
  useHistory,
  useModulesManager,
  useTranslations,
  formatMessageWithValues,
  Form,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { MSR_ETL_MODULE_NAME, HOUSEHOLD_SERVICES, LOCATION_SERVICES } from '../constants';
import HouseholdFiltersPanel from '../components/HouseholdFiltersPanel';
import UbrLocationFiltersPanel from '../components/UbrLocationFiltersPanel';
import { makeStyles } from '@material-ui/styles';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function loadSavedFilters(serviceName) {
  try {
    const raw = localStorage.getItem(`msrEtl_filters_${serviceName}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function MsrEtlFiltersPage({ match, intl, rights }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const serviceName = match?.params?.service_name ?? '';

  const [edited, setEdited] = useState(() => loadSavedFilters(serviceName) || {});
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const saved = loadSavedFilters(serviceName);
    setEdited(saved || {});
    setReset((prev) => prev + 1);
  }, [serviceName]);

  const pageTitle = formatMessageWithValues(
    intl,
    MSR_ETL_MODULE_NAME,
    'filters.pageTitle',
    { service: serviceName },
  );

  const back = () => history.goBack();
  const actions = [];

  const onEditedChanged = (data) => {
    setEdited(data);
  };

  const save = (data) => {
    // Save to localStorage
    if (data) {
      localStorage.setItem(`msrEtl_filters_${serviceName}`, JSON.stringify(data));
    }
  };

  const renderFilterPanel = () => {
    if (HOUSEHOLD_SERVICES.includes(serviceName)) {
      return HouseholdFiltersPanel;
    }
    if (LOCATION_SERVICES.includes(serviceName)) {
      return UbrLocationFiltersPanel;
    }
    return null;
  };

  const filterPanel = renderFilterPanel();

  if (!filterPanel) {
    return (
      <div className={classes.page}>
        <Form
          module={MSR_ETL_MODULE_NAME}
          back={back}
          title={pageTitle}
        />
      </div>
    );
  }

  const HeadPanel = (props) => {
    const FilterPanel = filterPanel;
    return <FilterPanel {...props} serviceName={serviceName} />;
  };

  return (
    <div className={classes.page}>
      <Form
        module={MSR_ETL_MODULE_NAME}
        back={back}
        save={save}
        title={pageTitle}
        edited={edited}
        onEditedChanged={onEditedChanged}
        reset={reset}
        mandatoryFieldsEmpty={null}
        canSave={() => true}
        HeadPanel={HeadPanel}
        actions={actions}
        rights={rights}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MsrEtlFiltersPage));
