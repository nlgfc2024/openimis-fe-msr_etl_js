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
  Typography,
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
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import {
  fetchMsrEtlServices,
  scheduleUbrLocationInitialPull,
  clearScheduleUbrLocationInitialPull,
  fetchUbrLocationInitialPullStatus,
} from '../actions';
import {
  MSR_ETL_MODULE_NAME,
  RIGHT_MSR_ETL_SEARCH,
  RIGHT_MSR_ETL_EXPORT,
  MSR_ETL_SERVICES,
} from '../constants';

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
  statusMessage: {
    marginTop: theme.spacing(1),
  },
});

function MsrEtlConfigsPage({
  history,
  classes,
  rights,
  fetchingMsrEtlServices,
  etlServices,
  errorEtlServices,
  schedulingUbrLocationInitialPull,
  errorScheduleUbrLocationInitialPull,
  locationInitialPullRequestId,
  locationInitialPullStatus,
  fetchingLocationInitialPullStatus,
  errorLocationInitialPullStatus,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);

  useEffect(() => {
    dispatch(fetchMsrEtlServices());
  }, []);

  useEffect(() => {
    const requestId = typeof locationInitialPullRequestId === 'string' ? locationInitialPullRequestId.trim() : '';
    if (!requestId) return undefined;
    if (["COMPLETED", "FAILED"].includes(locationInitialPullStatus?.status)) return undefined;

    const poll = () => dispatch(fetchUbrLocationInitialPullStatus(requestId));
    poll();
    const intervalId = setInterval(poll, 3000);

    return () => clearInterval(intervalId);
  }, [locationInitialPullRequestId, locationInitialPullStatus?.status]);

  if (!rights.includes(RIGHT_MSR_ETL_SEARCH)) {
    return null;
  }

  const handleEditFilters = (service) => {
    historyPush(modulesManager, history, 'msrEtl.route.filters', [service.nameOfService]);
  };

  const handleLocationInitialPull = () => {
    dispatch(clearScheduleUbrLocationInitialPull());
    dispatch(scheduleUbrLocationInitialPull());
  };

  const isLocationService = (serviceName) => {
    const normalized = String(serviceName || '').toLowerCase();
    return normalized === MSR_ETL_SERVICES.UBR_LOCATION_SERVICE.toLowerCase() || normalized.includes('location');
  };

  const canScheduleInitialPull = rights.includes(RIGHT_MSR_ETL_EXPORT);
  const isProcessingPullStatus = ["SUBMITTED", "QUEUED", "PROCESSING"].includes(locationInitialPullStatus?.status);
  const locationPullStatusText = locationInitialPullStatus
    ? `${locationInitialPullStatus.status}: ${locationInitialPullStatus.message || ''}`.trim()
    : null;

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
                          disabled={schedulingUbrLocationInitialPull || isProcessingPullStatus}
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
        progress={schedulingUbrLocationInitialPull || fetchingLocationInitialPullStatus || isProcessingPullStatus}
        error={errorScheduleUbrLocationInitialPull || errorLocationInitialPullStatus}
      />
      {!!locationPullStatusText && (
        <Typography variant="body2" color="textSecondary" className={classes.statusMessage}>
          {locationPullStatusText}
        </Typography>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingMsrEtlServices: state.msrEtl.fetchingMsrEtlServices,
  etlServices: state.msrEtl.etlServices,
  errorEtlServices: state.msrEtl.errorEtlServices,
  schedulingUbrLocationInitialPull: state.msrEtl.schedulingUbrLocationInitialPull,
  errorScheduleUbrLocationInitialPull: state.msrEtl.errorScheduleUbrLocationInitialPull,
  locationInitialPullRequestId: state.msrEtl.locationInitialPullRequestId,
  locationInitialPullStatus: state.msrEtl.locationInitialPullStatus,
  fetchingLocationInitialPullStatus: state.msrEtl.fetchingLocationInitialPullStatus,
  errorLocationInitialPullStatus: state.msrEtl.errorLocationInitialPullStatus,
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(MsrEtlConfigsPage)))));