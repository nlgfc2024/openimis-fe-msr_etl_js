import React from 'react';
import { PublishedComponent } from '@openimis/fe-core';

/**
 * LocationFilter
 *
 * Simple wrapper that exposes the OpenIMIS location cascader under
 * the `msrEtl` module namespace so other components can consume a
 * single published component reference.
 */
function LocationFilter({ value, onChange, withLabel, label, readOnly }) {
  return (
    <PublishedComponent
      pubRef="location.LocationCascader"
      value={value}
      onChange={onChange}
      withLabel={withLabel}
      label={label}
      readOnly={readOnly}
    />
  );
}

export default LocationFilter;
