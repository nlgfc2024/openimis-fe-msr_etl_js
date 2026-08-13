import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  MenuItem,
  Select,
  Typography,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import {
  Helmet,
  useModulesManager,
  useTranslations,
  useAsyncJob,
  useParams,
  useHistory,
  PublishedComponent,
  ProgressOrError,
  withModulesManager,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { fetchMsrEtlSyncUnits, clearMsrEtlSyncUnits, fetchMsrUbrLocations } from '../actions';
import { buildUbrLocationNameMap } from '../util/location';
import { MSR_ETL_MODULE_NAME } from '../constants';

const FETCH_LIMIT = 300;

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  paperHeader: theme.table.title,
  header: theme.table.header,
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  titleRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  content: {
    padding: theme.spacing(2),
  },
  summary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  truncationNotice: {
    marginTop: theme.spacing(1),
  },
});

const SYNC_STATUS_COLOR = {
  SYNCED: 'primary',
  FAILED: 'secondary',
  PENDING: 'default',
};

function groupCounts(units) {
  const groups = {};
  units.forEach((unit) => {
    const key = unit.unitType;
    groups[key] = groups[key] || { total: 0, staged: 0, synced: 0, failed: 0 };
    groups[key].total += 1;
    if (unit.stageStatus === 'STAGED') groups[key].staged += 1;
    if (unit.syncStatus === 'SYNCED') groups[key].synced += 1;
    if (unit.stageStatus === 'FAILED' || unit.syncStatus === 'FAILED') groups[key].failed += 1;
  });
  return groups;
}

function MsrEtlSyncLogPage({ classes }) {
  const { client_mutation_id: clientMutationId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const [syncStatusFilter, setSyncStatusFilter] = useState('');

  const { job } = useAsyncJob({ clientMutationId });
  const jobUuid = job?.uuid;

  const units = useSelector((state) => state.msrEtl.msrEtlSyncUnits);
  const totalCount = useSelector((state) => state.msrEtl.msrEtlSyncUnitsTotalCount);
  const fetching = useSelector((state) => state.msrEtl.fetchingMsrEtlSyncUnits);
  const error = useSelector((state) => state.msrEtl.errorMsrEtlSyncUnits);
  const ubrLocationBatches = useSelector((state) => state.msrEtl.ubrLocationBatches);
  const locationNameByCode = useMemo(() => buildUbrLocationNameMap(ubrLocationBatches), [ubrLocationBatches]);

  const refresh = () => {
    if (!jobUuid) return;
    dispatch(fetchMsrEtlSyncUnits(jobUuid, {
      syncStatus: syncStatusFilter || undefined,
      limit: FETCH_LIMIT,
    }));
  };

  useEffect(() => {
    dispatch(fetchMsrUbrLocations({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
    return () => dispatch(clearMsrEtlSyncUnits());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobUuid, syncStatusFilter]);

  const groups = useMemo(() => groupCounts(units), [units]);

  const unitCodeLabel = (unit) => {
    const name = locationNameByCode[unit.unitCode];
    return name ? `${unit.unitCode} - ${name}` : unit.unitCode;
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('syncLog.pageTitle')} />
      <Paper className={classes.paper}>
        <Grid container className={`${classes.paperHeader} ${classes.titleRow}`}>
          <Grid item className={classes.titleLeft}>
            <Tooltip title={formatMessage('syncLog.back')}>
              <IconButton onClick={() => history.goBack()} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6">{formatMessage('syncLog.pageTitle')}</Typography>
          </Grid>
          <Grid item className={classes.titleRight}>
            <Select value={syncStatusFilter} onChange={(e) => setSyncStatusFilter(e.target.value)} displayEmpty>
              <MenuItem value="">{formatMessage('syncLog.filter.all')}</MenuItem>
              <MenuItem value="FAILED">{formatMessage('syncLog.filter.failedOnly')}</MenuItem>
              <MenuItem value="SYNCED">{formatMessage('syncLog.filter.syncedOnly')}</MenuItem>
              <MenuItem value="PENDING">{formatMessage('syncLog.filter.pendingOnly')}</MenuItem>
            </Select>
            <Tooltip title={formatMessage('syncLog.refresh')}>
              <IconButton onClick={refresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <div className={classes.content}>
          <PublishedComponent pubRef="core.AsyncJobProgress" clientMutationId={clientMutationId} />

          <div className={classes.summary}>
            {Object.entries(groups).map(([unitType, counts]) => (
              <Chip
                key={unitType}
                label={`${unitType}: ${counts.staged} staged, ${counts.synced} synced${
                  counts.failed ? `, ${counts.failed} failed` : ''
                }`}
                color={counts.failed ? 'secondary' : 'default'}
              />
            ))}
          </div>

          <TableContainer>
            <Table size="small">
              <TableHead className={classes.header}>
                <TableRow className={classes.paperHeader}>
                  <TableCell>{formatMessage('syncLog.unitType')}</TableCell>
                  <TableCell>{formatMessage('syncLog.unitCode')}</TableCell>
                  <TableCell>{formatMessage('syncLog.stageStatus')}</TableCell>
                  <TableCell>{formatMessage('syncLog.syncStatus')}</TableCell>
                  <TableCell>{formatMessage('syncLog.attempts')}</TableCell>
                  <TableCell>{formatMessage('syncLog.errorDetail')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <ProgressOrError progress={fetching} error={error} />
                {!fetching && units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unitType}</TableCell>
                    <TableCell>{unitCodeLabel(unit)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={unit.stageStatus} color={SYNC_STATUS_COLOR[unit.stageStatus]} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={unit.syncStatus} color={SYNC_STATUS_COLOR[unit.syncStatus]} />
                    </TableCell>
                    <TableCell>{unit.attempts}</TableCell>
                    <TableCell>{unit.errorDetail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalCount > units.length && (
            <Typography variant="body2" color="textSecondary" className={classes.truncationNotice}>
              {formatMessageWithValues('syncLog.truncated', { shown: units.length, total: totalCount })}
            </Typography>
          )}
        </div>
      </Paper>
    </div>
  );
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MsrEtlSyncLogPage))));
