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
  useAsyncJob,
  ProgressOrError,
  PublishedComponent,
  historyPush,
  withModulesManager,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import {
  fetchMsrEtlServices,
  scheduleMsrUbrLocationsImport,
  clearScheduleUbrLocationsImport,
  fetchActiveMsrEtlJob,
} from '../actions';
import {
  MSR_ETL_MODULE_NAME,
  RIGHT_MSR_ETL_SEARCH,
  RIGHT_MSR_ETL_EXPORT,
  MSR_ETL_SERVICES,
} from '../constants';
import { translateMsrEtlError } from '../util/errors';

const styles = (theme) => ({
  page: theme.page,
  headerTitle: theme.table.title,
  header: theme.table.header,
  actionCell: {
    width: 340,
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
});

function MsrEtlConfigsPage({
  history,
  classes,
  rights,
  fetchingMsrEtlServices,
  etlServices,
  errorEtlServices,
  schedulingUbrLocationsImport,
  errorScheduleUbrLocationsImport,
  scheduledUbrLocationsImportClientMutationId,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  useEffect(() => {
    dispatch(fetchMsrEtlServices());
    dispatch(fetchActiveMsrEtlJob('ubr_locations_import'));
  }, []);

  const isLocationsImportTracked = !!scheduledUbrLocationsImportClientMutationId;
  const { isTerminal: isTrackedLocationsJobTerminal } = useAsyncJob({
    clientMutationId: isLocationsImportTracked ? scheduledUbrLocationsImportClientMutationId : undefined,
  });

  if (!rights.includes(RIGHT_MSR_ETL_SEARCH)) {
    return null;
  }

  const handleEditFilters = (service) => {
    historyPush(modulesManager, history, `${MSR_ETL_MODULE_NAME}.route.filters`, [service.nameOfService]);
  };

  const handleLocationInitialPull = () => {
    dispatch(clearScheduleUbrLocationsImport());
    dispatch(scheduleMsrUbrLocationsImport());
  };

  // duplicate-submission guard: a matching job is still RECEIVED/QUEUED/RUNNING
  const blockedByActiveJob = isLocationsImportTracked && !isTrackedLocationsJobTerminal;

  const isLocationService = (serviceName) => {
    const normalized = String(serviceName || '').toLowerCase();
    return normalized === MSR_ETL_SERVICES.UBR_LOCATION_SERVICE.toLowerCase() || normalized.includes('location');
  };

  const canScheduleInitialPull = rights.includes(RIGHT_MSR_ETL_EXPORT);

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
                  <div className={classes.actionButtons}>
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
                    {isLocationService(service.nameOfService) && canScheduleInitialPull && (
                      <Tooltip title={formatMessage('etlServices.initialPull.tooltip')}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<CloudDownloadIcon />}
                          onClick={handleLocationInitialPull}
                          disabled={schedulingUbrLocationsImport || blockedByActiveJob}
                        >
                          {formatMessage('etlServices.initialPull')}
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ProgressOrError
        progress={schedulingUbrLocationsImport}
        error={translateMsrEtlError(errorScheduleUbrLocationsImport, formatMessage)}
      />
      {!!scheduledUbrLocationsImportClientMutationId && (
        <PublishedComponent
          pubRef="core.AsyncJobProgress"
          clientMutationId={scheduledUbrLocationsImportClientMutationId}
        />
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingMsrEtlServices: state.msrEtl.fetchingMsrEtlServices,
  etlServices: state.msrEtl.etlServices,
  errorEtlServices: state.msrEtl.errorEtlServices,
  schedulingUbrLocationsImport: state.msrEtl.schedulingUbrLocationsImport,
  errorScheduleUbrLocationsImport: state.msrEtl.errorScheduleUbrLocationsImport,
  scheduledUbrLocationsImportClientMutationId: state.msrEtl.scheduledUbrLocationsImportClientMutationId,
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(MsrEtlConfigsPage)))));