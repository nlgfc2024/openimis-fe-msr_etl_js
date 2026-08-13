import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { formatMessage, withModulesManager, Autocomplete } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchMsrUbrLocations } from "../actions";

const styles = (theme) => ({
  item: theme.paper.item,
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

function findSelectedOption(options, value) {
  if (!value) return null;
  return options.find((option) => option.value === value) || null;
}

function LocationFiltersPanel({
  intl,
  edited,
  onEditedChanged,
  readOnly,
  classes,
  fetchingMsrUbrLocations,
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

  const onDistrictChange = (option) => {
    const district = option?.value || "";
    setLocation({ district });
    if (district) {
      fetchMsrUbrLocations({ location: { district } });
    }
  };

  const onTaChange = (option) => {
    const ta = option?.value || "";
    setLocation({ district: selectedDistrict, ta });
  };

  const onGvhChange = (option) => {
    const gvh = option?.value || "";
    setLocation({ district: selectedDistrict, ta: selectedTa, gvh });
  };

  const handleInputChange = () => {};

  return (
    <Grid container className={classes.item}>
      <Grid item xs={12} md={4} className={classes.item}>
        <Autocomplete
          module="msrEtl"
          label={formatMessage(intl, "msrEtl", "location.district")}
          options={districtOptions}
          value={findSelectedOption(districtOptions, selectedDistrict)}
          onChange={onDistrictChange}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly || fetchingMsrUbrLocations}
        />
      </Grid>

      <Grid item xs={12} md={4} className={classes.item}>
        <Autocomplete
          module="msrEtl"
          label={formatMessage(intl, "msrEtl", "location.tas")}
          options={taOptions}
          value={findSelectedOption(taOptions, selectedTa)}
          onChange={onTaChange}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly || !selectedDistrict || fetchingMsrUbrLocations}
        />
      </Grid>

      <Grid item xs={12} md={4} className={classes.item}>
        <Autocomplete
          module="msrEtl"
          label={formatMessage(intl, "msrEtl", "location.gvh")}
          options={gvhOptions}
          value={findSelectedOption(gvhOptions, selectedGvh)}
          onChange={onGvhChange}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, v) => option.value === v?.value}
          readOnly={readOnly || !selectedTa || fetchingMsrUbrLocations}
        />
      </Grid>
    </Grid>
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
  ubrLocationBatches: PropTypes.arrayOf(
    PropTypes.shape({
      dataType: PropTypes.string,
      locations: PropTypes.array,
    }),
  ),
  fetchMsrUbrLocations: PropTypes.func.isRequired,
  classes: PropTypes.shape({
    item: PropTypes.string,
  }).isRequired,
};

LocationFiltersPanel.defaultProps = {
  edited: null,
  readOnly: false,
  fetchingMsrUbrLocations: false,
  ubrLocationBatches: [],
};

const mapStateToProps = (state) => ({
  fetchingMsrUbrLocations: state.msrEtl?.fetchingMsrUbrLocations,
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
