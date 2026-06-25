import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
} from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import {
  Helmet,
  useModulesManager,
  useTranslations,
  ProgressOrError,
  historyPush,
  withModulesManager,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { fetchMsrEtlServices } from '../actions';
import { MSR_ETL_MODULE_NAME, RIGHT_MSR_ETL_SEARCH } from '../constants';

const styles = (theme) => ({
  page: theme.page,
  headerTitle: theme.table.title,
  header: theme.table.header,
  actionCell: {
    width: 180,
  },
});

function MsrEtlConfigsPage({ history, classes, rights, fetchingMsrEtlServices, etlServices, errorEtlServices }) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  useEffect(() => {
    dispatch(fetchMsrEtlServices());
  }, []);

  if (!rights.includes(RIGHT_MSR_ETL_SEARCH)) {
    return null;
  }

  const handleEditFilters = (service) => {
    historyPush(modulesManager, history, 'msrEtl.route.filters', [service.nameOfService]);
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('etlServices.pageTitle')} />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead className={classes.header}>
            <TableRow className={classes.headerTitle}>
              <TableCell>{formatMessage('etlServices.serviceName')}</TableCell>
              <TableCell className={classes.actionCell}>
                {formatMessage('etlServices.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <ProgressOrError progress={fetchingMsrEtlServices} error={errorEtlServices} />
            {!fetchingMsrEtlServices && etlServices.map((service) => (
              <TableRow key={service.nameOfService}>
                <TableCell>{service.nameOfService}</TableCell>
                <TableCell>
                  <Tooltip title={formatMessage('etlServices.editFilters.tooltip')}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<FilterListIcon />}
                      onClick={() => handleEditFilters(service)}
                    >
                      {formatMessage('etlServices.editFilters')}
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingMsrEtlServices: state.msrEtl.fetchingMsrEtlServices,
  etlServices: state.msrEtl.etlServices,
  errorEtlServices: state.msrEtl.errorEtlServices,
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(MsrEtlConfigsPage)))));