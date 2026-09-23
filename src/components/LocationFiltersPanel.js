import React from "react";
import { Grid } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { formatMessage, PublishedComponent } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";

import { MSR_ETL_MODULE_NAME } from "../constants";
import SourceTypeSelector from "./SourceTypeSelector";

const styles = (theme) => ({
  item: theme.paper.item,
});

function LocationFiltersPanel({ intl, edited, onEditedChanged, readOnly, classes }) {
  const onLocationChange = (value) => {
    onEditedChanged({ ...(edited || {}), location: value });
  };

  const onSourceTypeChange = (value) => {
    onEditedChanged({ ...(edited || {}), sourceType: value });
  };

  return (
    <Grid container className={classes.item}>
      <Grid item xs={12} md={6} className={classes.item}>
        <SourceTypeSelector
          kind="location"
          value={edited?.sourceType}
          onChange={onSourceTypeChange}
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={12} md={6} className={classes.item}>
        <PublishedComponent
          pubRef="location.LocationCascader"
          value={edited?.location}
          onChange={onLocationChange}
          withLabel
          label={formatMessage(intl, MSR_ETL_MODULE_NAME, "location")}
          readOnly={readOnly}
          maxLevel={3}
          required
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(LocationFiltersPanel)));
