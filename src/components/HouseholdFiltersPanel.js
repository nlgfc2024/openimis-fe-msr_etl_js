import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage, Autocomplete, NumberInput, withModulesManager } from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  MSR_ETL_MODULE_NAME,
  DEFAULT_CLASSIFICATIONS,
  YES_NO_OPTIONS,
  HOUSEHOLD_HEAD_GENDER_OPTIONS,
  EXCLUSION_PROGRAM_OPTIONS,
} from '../constants';
import { findSelectedOption } from '../util/options';

const styles = (theme) => ({
  item: theme.paper.item
});

function loadSavedFilters(serviceName) {
  try {
    const raw = localStorage.getItem(`${MSR_ETL_MODULE_NAME}_filters_${serviceName}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function findSelectedOptions(options, values) {
  if (!Array.isArray(values)) return [];
  return options.filter((option) => values.includes(option.value));
}

/**
 * HouseholdFiltersPanel
 *
 * Provides filter fields for household ETL services: wealth classification,
 * location, min/max age.
 *
 * The component is rendered by the openIMIS `Form` helper, so it receives
 * `edited` / `onEditedChanged` / `readOnly` props.
 */
function HouseholdFiltersPanel({
  intl, modulesManager, edited, onEditedChanged, readOnly, classes, serviceName,
  classifications,
}) {
  const [initialized, setInitialized] = useState(false);

  const classificationOptions = classifications?.length ? classifications : DEFAULT_CLASSIFICATIONS;

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
      localStorage.setItem(`${MSR_ETL_MODULE_NAME}_filters_${serviceName}`, JSON.stringify(newData));
    }
  };

  const onClassificationChange = (value) => onChange('classifications')(value);
  const onLocationChange = (value) => onChange('location')(value);
  const onMinAgeChange = (value) => onChange('minAge')(value);
  const onMaxAgeChange = (value) => onChange('maxAge')(value);
  const onLowerPercentileCategoryChange = (value) => onChange('lowerPercentileCategory')(value ?? 0);
  const onUpperPercentileCategoryChange = (value) => onChange('upperPercentileCategory')(value ?? 100);
  const onHouseholdHasLabourChange = (value) => onChange('householdHasLabour')(value?.value ?? '');
  const onHouseholdHeadGenderChange = (value) => onChange('householdHeadGender')(value?.value ?? '');
  const onExclusionProgramsChange = (value) => onChange('exclusionPrograms')((value || []).map((option) => option.value));

  const handleInputChange = () => {};

  return (
      <Grid container className={ classes.item}>
        {/* Wealth Classification */}
        <Grid item xs={4} md={6} className={classes.item}>
          <Autocomplete
          module={MSR_ETL_MODULE_NAME}
            label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.classification')}
            multiple
            options={classificationOptions}
            value={edited.classifications || []}
            onChange={onClassificationChange}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly}
        />
      </Grid>

      {/* Lower Percentile Category */}
      <Grid item xs={4} md={3} className={classes.item}>
        <NumberInput
          module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.lowerPercentileCategory')}
          min={0}
          max={100}
          value={edited.lowerPercentileCategory ?? 0}
          onChange={onLowerPercentileCategoryChange}
        />
      </Grid>

      {/* Upper Percentile Category */}
      <Grid item xs={4} md={3} className={classes.item}>
        <NumberInput
          module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.upperPercentileCategory')}
          min={0}
          max={100}
          value={edited.upperPercentileCategory ?? 100}
          onChange={onUpperPercentileCategoryChange}
        />
      </Grid>

        {/* Location */}
        <Grid item xs={4} md={6} className={classes.item}>
          <PublishedComponent
            pubRef="location.LocationCascader"
            value={edited.location}
            onChange={onLocationChange}
            withLabel
            label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'location')}
            readOnly={readOnly}
          />
        </Grid>

        {/* Min Age */}
        <Grid item xs={4} md={3} className={classes.item}>
          <NumberInput
          module={MSR_ETL_MODULE_NAME}
            label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.minAge')}
            min={0}
            value={edited.minAge}
            onChange={onMinAgeChange}
          readOnly={readOnly}
        />
      </Grid>

      {/* Max Age */}
      <Grid item xs={12} md={3} className={classes.item}>
        <NumberInput
        module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.maxAge')}
          min={0}
          value={edited.maxAge}
          onChange={onMaxAgeChange}
          readOnly={readOnly}
        />
      </Grid>

      <Grid item xs={12} md={6} className={classes.item}>
        <Autocomplete
          module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.householdHasLabour')}
          options={YES_NO_OPTIONS}
          value={findSelectedOption(YES_NO_OPTIONS, edited.householdHasLabour)}
          onChange={onHouseholdHasLabourChange}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly}
        />
      </Grid>

      <Grid item xs={12} md={6} className={classes.item}>
        <Autocomplete
          module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.householdHeadGender')}
          options={HOUSEHOLD_HEAD_GENDER_OPTIONS}
          value={findSelectedOption(HOUSEHOLD_HEAD_GENDER_OPTIONS, edited.householdHeadGender)}
          onChange={onHouseholdHeadGenderChange}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly}
        />
      </Grid>

      <Grid item xs={12} md={6} className={classes.item}>
        <Autocomplete
          module={MSR_ETL_MODULE_NAME}
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, 'household.filter.exclusionPrograms')}
          multiple
          options={EXCLUSION_PROGRAM_OPTIONS}
          value={findSelectedOptions(EXCLUSION_PROGRAM_OPTIONS, edited.exclusionPrograms)}
          onChange={onExclusionProgramsChange}
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
