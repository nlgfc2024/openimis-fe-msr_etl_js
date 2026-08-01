import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { FormControl, Grid, InputLabel, Paper, Select, FormHelperText, MenuItem, Typography } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { formatMessage, withModulesManager } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchMsrUbrLocations } from "../actions";

const styles = (theme) => ({
  item: theme.paper.item,
  panel: {
    padding: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  helper: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  error: {
    marginTop: theme.spacing(0.5),
  },
});

function toLocations(batch) {
  return Array.isArray(batch?.locations) ? batch.locations : [];
}

function mapOptions(locations) {
  return locations
    .map((location) => {
      const code = location?.geo_location_code;
      const name = location?.geo_location_name;
      const parentCode = location?.parent_geo_location_code;
      if (!code) return null;
      return {
        value: String(code),
        label: name ? `${name} (${code})` : String(code),
        parentCode: parentCode ? String(parentCode) : "",
      };
    })
    .filter(Boolean);
}

function LocationFiltersPanel({
  intl,
  edited,
  onEditedChanged,
  readOnly,
  classes,
  fetchingMsrUbrLocations,
  errorMsrUbrLocations,
  ubrLocationBatches,
  fetchMsrUbrLocations,
}) {
  const location = edited?.location || {};
  const selectedDistrict = location?.district || "";
  const selectedTa = location?.ta || "";
  const selectedGvh = location?.gvh || "";

  const districtOptions = useMemo(() => {
    const districtBatch = ubrLocationBatches.find((batch) => batch?.dataType === "D");
    return mapOptions(toLocations(districtBatch));
  }, [ubrLocationBatches]);

  const taOptions = useMemo(() => {
    const taBatch = ubrLocationBatches.find((batch) => batch?.dataType === "T");
    const tas = mapOptions(toLocations(taBatch));
    if (!selectedDistrict) return [];
    return tas.filter((ta) => ta.parentCode === selectedDistrict);
  }, [ubrLocationBatches, selectedDistrict]);

  const gvhOptions = useMemo(() => {
    const gvhBatch = ubrLocationBatches.find((batch) => batch?.dataType === "G");
    const gvhs = mapOptions(toLocations(gvhBatch));
    if (!selectedTa) return [];
    return gvhs.filter((gvh) => gvh.parentCode === selectedTa);
  }, [ubrLocationBatches, selectedTa]);

  useEffect(() => {
    fetchMsrUbrLocations({});
  }, [fetchMsrUbrLocations]);

  useEffect(() => {
    if (selectedDistrict && selectedTa) {
      fetchMsrUbrLocations({ location: { district: selectedDistrict, ta: selectedTa } });
      return;
    }

    if (selectedDistrict) {
      fetchMsrUbrLocations({ location: { district: selectedDistrict } });
    }
  }, [fetchMsrUbrLocations, selectedDistrict, selectedTa]);

  const setLocation = (newLocation) => {
    const cleaned = {
      ...(newLocation?.district ? { district: newLocation.district } : {}),
      ...(newLocation?.ta ? { ta: newLocation.ta } : {}),
      ...(newLocation?.gvh ? { gvh: newLocation.gvh } : {}),
    };

    onEditedChanged({
      ...(edited || {}),
      locationSelection: cleaned,
      location: cleaned,
    });
  };

  const onDistrictChange = (event) => {
    const district = event.target.value || "";
    setLocation({ district });
    if (district) {
      fetchMsrUbrLocations({ location: { district } });
    }
  };

  const onTaChange = (event) => {
    const ta = event.target.value || "";
    const nextLocation = { district: selectedDistrict, ta };
    setLocation(nextLocation);
  };

  const onGvhChange = (event) => {
    const gvh = event.target.value || "";
    setLocation({ district: selectedDistrict, ta: selectedTa, gvh });
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.panel}>
      <Typography variant="subtitle2" className={classes.title}>
        {formatMessage(intl, "msrEtl", "location")}
      </Typography>

      <Grid container spacing={2} className={classes.container}>
        <Grid item xs={12} md={6} className={classes.item}>
          <FormControl variant="outlined" fullWidth size="small" disabled={readOnly || fetchingMsrUbrLocations}>
            <InputLabel>{formatMessage(intl, "msrEtl", "location.district")}</InputLabel>
            <Select
              value={selectedDistrict}
              onChange={onDistrictChange}
              label={formatMessage(intl, "msrEtl", "location.district")}
            >
              <MenuItem value="" />
              {districtOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6} className={classes.item}>
          <FormControl
            variant="outlined"
            fullWidth
            size="small"
            disabled={readOnly || !selectedDistrict || fetchingMsrUbrLocations}
          >
            <InputLabel>{formatMessage(intl, "msrEtl", "location.tas")}</InputLabel>
            <Select value={selectedTa} onChange={onTaChange} label={formatMessage(intl, "msrEtl", "location.tas")}>
              <MenuItem value="" />
              {taOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6} className={classes.item}>
          <FormControl
            variant="outlined"
            fullWidth
            size="small"
            disabled={readOnly || !selectedTa || fetchingMsrUbrLocations}
          >
            <InputLabel>{formatMessage(intl, "msrEtl", "location.gvh")}</InputLabel>
            <Select value={selectedGvh} onChange={onGvhChange} label={formatMessage(intl, "msrEtl", "location.gvh")}>
              <MenuItem value="" />
              {gvhOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          {!selectedDistrict && (
            <FormHelperText className={classes.helper}>
              {formatMessage(intl, "msrEtl", "location.hint.initial")}
            </FormHelperText>
          )}
          {!!selectedDistrict && !selectedTa && (
            <FormHelperText className={classes.helper}>
              {formatMessage(intl, "msrEtl", "location.hint.selectTa")}
            </FormHelperText>
          )}
          {!!selectedTa && !selectedGvh && (
            <FormHelperText className={classes.helper}>
              {formatMessage(intl, "msrEtl", "location.hint.selectGvh")}
            </FormHelperText>
          )}
          {!!errorMsrUbrLocations && (
            <FormHelperText error className={classes.error}>
              {String(errorMsrUbrLocations)}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

LocationFiltersPanel.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  edited: PropTypes.shape({
    locationSelection: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    location: PropTypes.oneOfType([
      PropTypes.shape({
        district: PropTypes.string,
        ta: PropTypes.string,
        gvh: PropTypes.string,
      }),
      PropTypes.array,
      PropTypes.object,
    ]),
  }),
  onEditedChanged: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  fetchingMsrUbrLocations: PropTypes.bool,
  errorMsrUbrLocations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ubrLocationBatches: PropTypes.arrayOf(
    PropTypes.shape({
      dataType: PropTypes.string,
      locations: PropTypes.array,
    }),
  ),
  fetchMsrUbrLocations: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    item: PropTypes.string,
    panel: PropTypes.string,
    title: PropTypes.string,
    container: PropTypes.string,
    helper: PropTypes.string,
    error: PropTypes.string,
  }).isRequired,
};

LocationFiltersPanel.defaultProps = {
  edited: null,
  readOnly: false,
  fetchingMsrUbrLocations: false,
  errorMsrUbrLocations: null,
  ubrLocationBatches: [],
};

const mapStateToProps = (state) => ({
  fetchingMsrUbrLocations: state.msrEtl?.fetchingMsrUbrLocations,
  errorMsrUbrLocations: state.msrEtl?.errorMsrUbrLocations,
  ubrLocationBatches: state.msrEtl?.ubrLocationBatches || [],
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMsrUbrLocations,
    },
    dispatch,
  );

export default injectIntl(
  withModulesManager(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(LocationFiltersPanel)))),
);
