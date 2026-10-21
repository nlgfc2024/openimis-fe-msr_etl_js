import React from "react";
import { useSelector } from "react-redux";
import { Grid, Typography } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { ProgressOrError, formatMessage } from "@openimis/fe-core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { MSR_ETL_MODULE_NAME } from "../constants";
import { normalizeLocationSelection } from "../util/location";
import { gridWidth } from "../util/dynamicFilters";
import DynamicFilterField from "./DynamicFilterField";
import SourceTypeSelector from "./SourceTypeSelector";
import FormLoader from "./FormLoader";

const styles = (theme) => ({
  item: theme.paper.item,
});

/**
 * DynamicFiltersPanel
 *
 * Renders the Data Source picker plus whichever fields that source declares
 * in its admin-configured filter_schema (see MsrEtlConfig.sources.<type>).
 * Adding a new source, or changing an existing one's fields, is a config
 * change only - this panel never needs code changes for it.
 */
function DynamicFiltersPanel({ intl, edited, onEditedChanged, readOnly, classes, kind }) {
  const sourceTypes = useSelector((state) =>
    kind === "location" ? state.msrEtl.locationSourceTypes : state.msrEtl.individualSourceTypes,
  );
  const fetched = useSelector((state) => state.msrEtl.fetchedMsrEtlSourceTypes);
  const error = useSelector((state) => state.msrEtl.errorMsrEtlSourceTypes);
  const ready = fetched && (sourceTypes.length !== 1 || !!edited?.sourceType);
  const schema = sourceTypes.find((sourceType) => sourceType.value === edited?.sourceType)?.filterSchema || [];

  const onSourceTypeChange = (value) => {
    onEditedChanged({ ...(edited || {}), sourceType: value, filters: {}, location: undefined });
  };

  const onFieldChange = (field) => (value) => {
    if (field.type === "location") {
      const normalized = normalizeLocationSelection(value);
      onEditedChanged({
        ...(edited || {}),
        location: value,
        filters: {
          ...(edited?.filters || {}),
          district: normalized.district,
          ta: normalized.ta,
          gvh: normalized.gvh,
          village: normalized.village,
        },
      });
      return;
    }

    onEditedChanged({
      ...(edited || {}),
      filters: { ...(edited?.filters || {}), [field.name]: value },
    });
  };

  const sourceTypeSelector = (
    <SourceTypeSelector kind={kind} value={edited?.sourceType} onChange={onSourceTypeChange} readOnly={readOnly} />
  );

  return (
    <Grid container className={classes.item}>
      {sourceTypes.length > 1 ? (
        <Grid item xs={12} md={6} className={classes.item}>
          {sourceTypeSelector}
        </Grid>
      ) : (
        sourceTypeSelector
      )}
      {error && (
        <Grid item xs={12}>
          <ProgressOrError error={error} />
        </Grid>
      )}
      {!error && !ready && (
        <Grid item xs={12}>
          <FormLoader />
        </Grid>
      )}
      {ready && sourceTypes.length === 0 && (
        <Grid item xs={12} className={classes.item}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage(intl, MSR_ETL_MODULE_NAME, "filters.noSourceConfigured")}
          </Typography>
        </Grid>
      )}
      {ready &&
        schema.map((field) => (
          <Grid
            item
            xs={12}
            md={field.type === "location" ? 12 : gridWidth(field.cols, 2)}
            className={classes.item}
            key={field.name}
          >
            <DynamicFilterField
              module={MSR_ETL_MODULE_NAME}
              field={field}
              value={field.type === "location" ? edited?.location : edited?.filters?.[field.name]}
              onChange={onFieldChange(field)}
              readOnly={readOnly}
            />
          </Grid>
        ))}
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(styles)(DynamicFiltersPanel)));
