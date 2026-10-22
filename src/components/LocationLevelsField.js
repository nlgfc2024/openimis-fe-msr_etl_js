import React from "react";
import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations } from "@openimis/fe-core";

import { LOCATION_LEVELS, MSR_ETL_MODULE_NAME } from "../constants";
import { gridWidth } from "../util/dynamicFilters";

const locationChain = (location) => {
  const chain = [];
  for (let current = location; current; current = current.parent) chain.unshift(current);
  return chain;
};

const LocationLevelsField = ({ value, onChange, maxLevel: maxLevelProp, cols, required, readOnly }) => {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(MSR_ETL_MODULE_NAME, modulesManager);
  const maxLevel = Math.min(
    maxLevelProp ?? parseInt(modulesManager.getConf("location", "Location.MaxLevels", 4), 10),
    LOCATION_LEVELS.length,
  );
  const chain = locationChain(value);
  const width = gridWidth(cols, maxLevel);

  const onLevelChange = (level) => (location) => {
    if (location) onChange({ ...location, parent: chain[level - 1] ?? location.parent });
    else onChange(chain[level - 1] ?? null);
  };

  return (
    <Grid container spacing={2}>
      {LOCATION_LEVELS.slice(0, maxLevel).map(({ pubRef, label }, level) => (
        <Grid item xs={12} md={width} key={pubRef}>
          <PublishedComponent
            key={chain[level - 1]?.uuid ?? "root"}
            pubRef={pubRef}
            value={chain[level] ?? null}
            parentLocation={chain[level - 1]}
            onChange={onLevelChange(level)}
            readOnly={readOnly || (level > 0 && !chain[level - 1])}
            required={required && level === 0}
            withLabel
            label={formatMessage(label)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default LocationLevelsField;
