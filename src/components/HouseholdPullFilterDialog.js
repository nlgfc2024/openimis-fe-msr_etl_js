import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { PublishedComponent, formatMessage } from '@openimis/fe-core';

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

function HouseholdPullFilterDialog({
  intl,
  open,
  onClose,
  onConfirm,
  classifications,
  genders,
  initialFilters,
  title,
  cancelLabel,
  confirmLabel,
}) {
  const classificationOptions = useMemo(
    () => (classifications?.length ? classifications : DEFAULT_CLASSIFICATIONS),
    [classifications],
  );
  const genderOptions = useMemo(
    () => (genders?.length ? genders : DEFAULT_GENDERS),
    [genders],
  );

  const [classification, setClassification] = useState(initialFilters?.classification ?? '');
  const [location, setLocation] = useState(initialFilters?.location ?? null);
  const [minAge, setMinAge] = useState(initialFilters?.minAge ?? '');
  const [maxAge, setMaxAge] = useState(initialFilters?.maxAge ?? '');
  const [gender, setGender] = useState(initialFilters?.gender ?? '');

  useEffect(() => {
    if (!open) return;
    setClassification(initialFilters?.classification ?? '');
    setLocation(initialFilters?.location ?? null);
    setMinAge(initialFilters?.minAge ?? '');
    setMaxAge(initialFilters?.maxAge ?? '');
    setGender(initialFilters?.gender ?? '');
  }, [open, initialFilters]);

  const handleConfirm = () => {
    const filters = {
      classification: classification || null,
      location: location || null,
      minAge: minAge === '' ? null : Number(minAge),
      maxAge: maxAge === '' ? null : Number(maxAge),
      gender: gender || null,
    };
    onConfirm?.(filters);
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title || formatMessage(intl, 'msrEtl', 'confirmPullingData.title')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="household-classification-label">
                {formatMessage(intl, 'msrEtl', 'household.filter.classification')}
              </InputLabel>
              <Select
                labelId="household-classification-label"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {classificationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <PublishedComponent
              pubRef="location.LocationCascader"
              value={location}
              onChange={setLocation}
              withLabel
              label={formatMessage(intl, 'msrEtl', 'location')}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label={formatMessage(intl, 'msrEtl', 'household.filter.minAge')}
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label={formatMessage(intl, 'msrEtl', 'household.filter.maxAge')}
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="household-gender-label">
                {formatMessage(intl, 'msrEtl', 'household.filter.gender')}
              </InputLabel>
              <Select
                labelId="household-gender-label"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {cancelLabel || formatMessage(intl, 'msrEtl', 'confirmPullingData.cancel')}
        </Button>
        <Button color="primary" variant="contained" onClick={handleConfirm}>
          {confirmLabel || formatMessage(intl, 'msrEtl', 'confirmPullingData.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(HouseholdPullFilterDialog);
