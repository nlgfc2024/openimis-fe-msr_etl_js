import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage, Autocomplete, NumberInput, withModulesManager } from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';

const DEFAULT_CLASSIFICATIONS = [
  { value: 'poorest', label: 'Poorest' },
  { value: 'poor', label: 'Poor' },
  { value: 'middle', label: 'Middle' },
  { value: 'better_off', label: 'Better Off' },
];

const DEFAULT_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const styles = (theme) => ({
  item: theme.paper.item
});

function loadSavedFilters(serviceName) {
  try {
    const raw = localStorage.getItem(`msrEtl_filters_${serviceName}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * HouseholdFiltersPanel
 *
 * Provides filter fields for household ETL services: wealth classification,
 * location, min/max age, and gender.
 *
 * The component is rendered by the openIMIS `Form` helper, so it receives
 * `edited` / `onEditedChanged` / `readOnly` props.
 */
function HouseholdFiltersPanel({
  intl, modulesManager, edited, onEditedChanged, readOnly, classes, serviceName,
  classifications, genders,
}) {
  const [initialized, setInitialized] = useState(false);

  const classificationOptions = classifications?.length ? classifications : DEFAULT_CLASSIFICATIONS;
  const genderOptions = genders?.length ? genders : DEFAULT_GENDERS;

  // Load saved filters from localStorage on mount if no edited data
  useEffect(() => {
    if (!initialized && serviceName && !edited) {
      const saved = loadSavedFilters(serviceName);
      if (saved) {
        onEditedChanged(saved);
      }
      setInitialized(true);
    }
  }, [serviceName, initialized]);

  const onChange = (field) => (value) => {
    const newData = { ...edited, [field]: value };
    onEditedChanged(newData);
    // Persist to localStorage
    if (serviceName) {
      localStorage.setItem(`msrEtl_filters_${serviceName}`, JSON.stringify(newData));
    }
  };

  const onClassificationChange = (value) => onChange('classifications')(value);
  const onLocationChange = (value) => onChange('location')(value);
  const onMinAgeChange = (value) => onChange('minAge')(value);
  const onMaxAgeChange = (value) => onChange('maxAge')(value);
  const onGenderChange = (value) => onChange('gender')(value?.value ?? '');

  const handleInputChange = () => {};

  return (
      <Grid container className={ classes.item}>
        {/* Wealth Classification */}
        <Grid item xs={4} md={6} className={classes.item}>
          <Autocomplete
            module="msrEtl"
            label={formatMessage(intl, 'msrEtl', 'household.filter.classification')}
            multiple
            options={classificationOptions}
            value={currentData.classifications || []}
            onChange={onClassificationChange}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, v) => option.value === v?.value}
            readOnly={readOnly}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={4} md={6} className={classes.item}>
          <PublishedComponent
            pubRef="location.LocationCascader"
            value={currentData.location}
            onChange={onLocationChange}
            withLabel
            label={formatMessage(intl, 'msrEtl', 'location')}
            readOnly={readOnly}
          />
        </Grid>

        {/* Min Age */}
        <Grid item xs={4} md={3} className={classes.item}>
          <NumberInput
            module="msrEtl"
            label={formatMessage(intl, 'msrEtl', 'household.filter.minAge')}
            min={0}
            value={currentData.minAge}
            onChange={onMinAgeChange}
            readOnly={readOnly}
          />
        </Grid>

        {/* Max Age */}
        <Grid item xs={12} md={3} className={classes.item}>
          <NumberInput
            module="msrEtl"
            label={formatMessage(intl, 'msrEtl', 'household.filter.maxAge')}
            min={0}
            value={currentData.maxAge}
            onChange={onMaxAgeChange}
            readOnly={readOnly}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} md={6} className={classes.item}>
          <Autocomplete
            module="msrEtl"
            label={formatMessage(intl, 'msrEtl', 'household.filter.gender')}
            options={genderOptions}
            value={currentData.gender}
            onChange={onGenderChange}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, v) => option.value === v?.value}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>
  );
}

export default injectIntl(withModulesManager(withTheme(withStyles(styles)(HouseholdFiltersPanel))));