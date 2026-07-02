import React, { useState, useEffect } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { Box, Button } from '@material-ui/core';
import {
  useHistory,
  useModulesManager,
  useTranslations,
  formatMessageWithValues,
  Form,
  ProgressOrError,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { makeStyles } from '@material-ui/styles';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { MSR_ETL_MODULE_NAME, MSR_ETL_SERVICES } from '../constants';
import HouseholdFiltersPanel from '../components/HouseholdFiltersPanel';
import { executeMsrUbrIndividualsImport, clearMsrEtlExecution } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  actions: {
    display: 'flex',
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
  executeMsrUbrIndividualsImport,
  clearMsrEtlExecution,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  const serviceName = match?.params?.service_name ?? '';

  const [edited, setEdited] = useState(() => loadSavedFilters(serviceName) || {});
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const saved = loadSavedFilters(serviceName);
    if (saved) setEdited(saved);
    setReset((prev) => prev + 1);
    clearMsrEtlExecution();
  }, [serviceName]);

  const pageTitle = formatMessageWithValues(
    intl,
    MSR_ETL_MODULE_NAME,
    'filters.pageTitle',
    { service: serviceName },
  );

  const back = () => history.goBack();

  const save = (data) => {
    if (data) {
      localStorage.setItem(`${MSR_ETL_MODULE_NAME}_filters_${serviceName}`, JSON.stringify(data));
    }
  };

  const renderFilterPanel = () => {
    if (MSR_ETL_SERVICES.UBR_INDIVIDUAL_SERVICE === serviceName) return HouseholdFiltersPanel;
    return null;
  };

  const onPullData = () => {
    save(edited);
    if (MSR_ETL_SERVICES.UBR_INDIVIDUAL_SERVICE === serviceName) {
      return executeMsrUbrIndividualsImport(edited);
    }
  };

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
        mandatoryFieldsEmpty={null}
        canSave={() => true}
        HeadPanel={filterPanel}
        actions={[]}
        rights={rights}
      />
      <Box className={classes.actions}>
        <Button variant="contained" color="primary" onClick={onPullData}>
          {formatMessage('filters.pullData')}
        </Button>
        <Button variant="outlined" onClick={back}>
          {formatMessage('dialog.cancel')}
        </Button>
      </Box>

      <ProgressOrError progress={executingUbrIndividualsImport} error={errorUbrIndividualsImport} />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  executeMsrUbrIndividualsImport,
  clearMsrEtlExecution,
}, dispatch);

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  executingUbrIndividualsImport: state.msrEtl.executingUbrIndividualsImport,
  errorUbrIndividualsImport: state.msrEtl.errorUbrIndividualsImport,
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MsrEtlFiltersPage));
