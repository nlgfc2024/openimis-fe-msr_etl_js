import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage, withModulesManager } from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';

const DEFAULT_FILTERS = {
  location: null,
};

const styles = (theme) => ({
  item: theme.paper.item,
});

function loadSavedFilters(serviceName) {
  try {
    const raw = localStorage.getItem(`msrEtl_filters_${serviceName}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function UbrLocationFiltersPanel({
  intl, edited, onEditedChanged, readOnly, classes, serviceName,
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && serviceName && !edited) {
      const saved = loadSavedFilters(serviceName);
      if (saved) {
        onEditedChanged(saved);
      }
      setInitialized(true);
    }
  }, [serviceName, initialized]);

  const onLocationChange = (value) => {
    const newData = { ...(edited || DEFAULT_FILTERS), location: value };
    onEditedChanged(newData);
    if (serviceName) {
      localStorage.setItem(`msrEtl_filters_${serviceName}`, JSON.stringify(newData));
    }
  };

  const currentData = edited || DEFAULT_FILTERS;

  return (
    <Grid container className={classes.item}>
      <Grid item xs={12} md={6} className={classes.item}>
        <PublishedComponent
          pubRef="msrEtl.LocationFilter"
          value={currentData.location}
          onChange={onLocationChange}
          withLabel
          label={formatMessage(intl, 'msrEtl', 'location')}
          readOnly={readOnly}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withModulesManager(withTheme(withStyles(styles)(UbrLocationFiltersPanel))));
