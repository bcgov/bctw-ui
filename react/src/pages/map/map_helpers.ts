import { FormStrings } from 'constants/strings';
import dayjs from 'dayjs';
import { ICodeFilter, IGroupedCodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryDetail, ITelemetryFeature, IUniqueFeature } from 'types/map';

const MAP_COLOURS = {
  point: '#00ff44',
  track: '#52baff',
  selected: '#ffff00',
  // 'selected polygon': '#ffff00',
  'unassigned point': '',
  'unassigned line segment': '',
  malfunction: '#FF8C00',
  mortality: '#ff0000',
  outline: '#fff'
};

/**
 *
 * @param feature
 * @returns
 */
const getFillColorByStatus = (feature: ITelemetryFeature, selected = false): string => {
  if (selected) {
    return MAP_COLOURS.selected;
  }
  if (!feature) {
    return MAP_COLOURS.point;
  }
  const { properties } = feature;
  if (properties?.animal_status === 'Mortality') {
    return MAP_COLOURS.mortality;
  } else if (properties?.device_status === 'Potential Mortality') {
    return MAP_COLOURS.malfunction;
  }
  return properties?.animal_colour ?? MAP_COLOURS.point;
};

/**
 * sets the @param layer {setStyle} function
 */
const fillPoint = (layer: any, selected = false): void => {
  if (typeof layer.setStyle !== 'function') {
    return;
  }
  layer.setStyle({
    class: selected ? 'selected-ping' : '',
    weight: 1.0,
    fillColor: getFillColorByStatus(layer.feature, selected)
  });
};

/**
 * @param features list of telemetry features to group
 * @param sortOption applied after the features are gruped by critter_id
 * @returns @type {IUniqueFeature}
 */
const groupFeaturesByCritters = (features: ITelemetryFeature[], sortOption?: DetailsSortOption): IUniqueFeature[] => {
  const uniques: IUniqueFeature[] = [];
  if (!features.length) {
    return uniques;
  }
  // filter out the (0,0) points
  const filtered = features.filter((f) => {
    const coords = f.geometry.coordinates;
    return coords[0] !== 0 && coords[1] !== 0;
  });
  filtered.forEach((f) => {
    const detail: ITelemetryDetail = f.properties;
    const found = uniques.find((c) => c.critter_id === detail.critter_id);
    if (!found) {
      uniques.push({
        critter_id: detail.critter_id,
        device_id: detail.device_id,
        frequency: detail.frequency,
        count: 1,
        features: [f]
      });
    } else {
      found.count++;
      found.features.push(f);
    }
  });
  const sorted = uniques.sort((a, b) => a[sortOption] - b[sortOption]);
  return sorted;
};

/**
 * accepts a list of filters, a list of objects that contain:
 * a) the code header
 * b) a string array of descriptions.
 * @param filters the ungrouped filters
 * @returns @type {IGroupedCodeFilter} array
 */
const groupFilters = (filters: ICodeFilter[]): IGroupedCodeFilter[] => {
  const groupObj = {};
  filters.forEach((f) => {
    if (!groupObj[f.code_header]) {
      groupObj[f.code_header] = [f.description];
    } else {
      groupObj[f.code_header].push(f.description);
    }
  });
  return Object.keys(groupObj).map((k) => {
    return { code_header: k, descriptions: groupObj[k] };
  });
};

/**
 * @param groupedFilters a list of filters that have been grouped into @type {IGroupedCodeFilter}
 * @param features the feature list to apply the filters to
 * @returns a filtered list of features that have one or more of the filters applied
 */
const applyFilter = (groupedFilters: IGroupedCodeFilter[], features: ITelemetryFeature[]): ITelemetryFeature[] => {
  return features.filter((f) => {
    const { properties } = f;
    for (let i = 0; i < groupedFilters.length; i++) {
      const { code_header, descriptions } = groupedFilters[i];
      const featureValue = properties[code_header];
      // when the 'empty' value is checked in a filter, and a feature value is not set
      if (descriptions.includes(FormStrings.emptySelectValue) && (featureValue === '' || featureValue === null)) {
        return true;
      }
      if (!descriptions.includes(featureValue)) {
        return false;
      }
    }
    return true;
  });
};

/**
 * @param array features to sort
 * @param comparator the comparator function
 * @returns the sorted @type {IUniqueFeature}
 */
function sortGroupedFeatures(array: IUniqueFeature[], comparator: (a, b) => number): IUniqueFeature[] {
  const stabilizedThis = array.map((el, idx) => [el.features[0].properties, idx] as [ITelemetryDetail, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  const critterIds = stabilizedThis.map((a) => a[0].critter_id);
  const ret = [];
  for (let i = 0; i < critterIds.length; i++) {
    const foundIndex = array.findIndex((a) => a.critter_id === critterIds[i]);
    ret.push(array[foundIndex]);
  }
  return ret;
}

/**
 * @param u list of grouped features @type {IUniqueFeature}
 * @returns unique feature IDs within the group
 */
const flattenUniqueFeatureIDs = (u: IUniqueFeature[]): number[] => {
  return u.map((uf) => uf.features.map((f) => f.id)).flatMap((x) => x);
};

/**
 * groups features by @property {critter_id}, and returns an array of unique critter_ids
 */
const getUniqueCritterIDsFromFeatures = (features: ITelemetryFeature[], selectedIDs: number[]): string[] => {
  const grped = groupFeaturesByCritters(features.filter((f) => selectedIDs.includes(f.id)));
  return grped.map((g) => g.critter_id);
};

const getUniqueDevicesFromFeatures = (features: ITelemetryFeature[]): number[] => {
  const ids = [];
  features.forEach((f) => {
    const did = f.properties.device_id;
    if (!ids.includes(did)) {
      ids.push(did);
    }
  });
  return ids;
};

/**
 * casts @param obj to @type {ITelemetryFeature}
 */
const getFeaturesFromGeoJSON = (obj: L.GeoJSON): ITelemetryFeature[] => {
  // fixme: why isn't feature a property of Layer??
  const features = obj.getLayers().map((d) => (d as any)?.feature as ITelemetryFeature);
  return features;
};

/**
 * @param features
 * @returns a single feature that contains the most recent date_recorded
 */
const getLatestTelemetryFeature = (features: ITelemetryFeature[]): ITelemetryFeature => {
  return features.reduce((accum, current) => {
    return dayjs(current.properties.date_recorded).isAfter(dayjs(accum.properties.date_recorded)) ? current : accum;
  });
};

const getEarliestTelemetryFeature = (features: ITelemetryFeature[]): ITelemetryFeature => {
  return features.reduce((accum, current) => {
    return dayjs(current.properties.date_recorded).isBefore(dayjs(accum.properties.date_recorded)) ? current : accum;
  });
}

// groups the param features by critter, returning an object containing:
// an array of the most recent pings
// an arrya of all other pings
const splitPings = (features: ITelemetryFeature[]): {latest: ITelemetryFeature[], other: ITelemetryFeature[]} => {
  const groupedByCritter = groupFeaturesByCritters(features);
  const latest = getGroupedLatestFeatures(groupedByCritter);
  const latestIds = latest.map(l => l.id);
  const other = features.filter(p => !latestIds.includes(p.id));
  return { latest, other }
}

// returns an array of the latest ping for each critter in the group
const getGroupedLatestFeatures = (grouped: IUniqueFeature[]): ITelemetryFeature[] => {
  const latestPings = [];
  grouped.forEach((g) => {
    latestPings.push(getLatestTelemetryFeature(g.features));
  });
  return latestPings;
};

// groups features by critter, returning the most recent 9 telemetry points
// returns 9 instead of 10 as the latest ping is stored in a separate layer
const getLast10Fixes = (pings: ITelemetryFeature[]): ITelemetryFeature[] => {
  const p = [];
  const grouped: IUniqueFeature[] = groupFeaturesByCritters(pings);
  for (let i = 0; i < grouped.length; i++) {
    const features = grouped[i].features;
    const sorted = features.sort((a, b) => {
      return new Date(b.properties.date_recorded).getTime() - new Date(a.properties.date_recorded).getTime();
    });
    const last10 = sorted.filter((s, idx) => idx > 0 && idx <= 9);
    p.push(...last10);
  }
  return p;
}

export {
  MAP_COLOURS,
  fillPoint,
  applyFilter,
  flattenUniqueFeatureIDs,
  getFillColorByStatus,
  getUniqueCritterIDsFromFeatures,
  getUniqueDevicesFromFeatures,
  groupFeaturesByCritters,
  groupFilters,
  sortGroupedFeatures,
  getLast10Fixes,
  getFeaturesFromGeoJSON,
  getEarliestTelemetryFeature,
  getLatestTelemetryFeature,
  getGroupedLatestFeatures,
  splitPings,
};
