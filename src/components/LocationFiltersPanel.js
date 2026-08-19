import React from "react";
import { Grid } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { MSR_ETL_MODULE_NAME } from "../constants";

const styles = (theme) => ({
  item: theme.paper.item,
});

/**
 * LocationFiltersPanel
 *
 * District/TA/GVH selection for the Location import tab, sourced from
 * openIMIS's own Location DB (not the external MSR/UBR system) via
 * fe-location's LocationCascader - the same picker HouseholdFiltersPanel uses.
 */
function LocationFiltersPanel({ intl, edited, onEditedChanged, readOnly, classes }) {
  const onLocationChange = (value) => {
    onEditedChanged({ ...(edited || {}), location: value });
  };

  return (
    <Grid container className={classes.item}>
      <Grid item xs={12} md={6} className={classes.item}>
        <PublishedComponent
          pubRef="location.LocationCascader"
          value={edited?.location}
          onChange={onLocationChange}
          withLabel
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, "location")}
          readOnly={readOnly}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(LocationFiltersPanel)));
