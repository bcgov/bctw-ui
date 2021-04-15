import dayjs from 'dayjs';
import { ICode, ICodeFilter, IGroupedCodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryDetail, ITelemetryFeature, IUniqueFeature } from 'types/map';

// todo: swap to "colour ID"?
const RESERVED_COLOUR_MAP = {
  'default point': '#00ff44',
  'default track': '#52baff',
  'selected point': '#ffff00',
  'selected polygon': '#ffff00',
  'unassigned point': '',
  'unassigned line segment': '',
  'potential malfunction': '#FF8C00',
  'potential mortality': '#ff0000',
  'outline': '#fff',
}

/**
 * @param codes the colour values retrieved from the code table
 * @returns an object with the reserved colour hex values
 */
const createColoursConst = (codes: ICode[]): Record<string, string>  => {
  const keys = Object.keys(RESERVED_COLOUR_MAP);
  keys.forEach(k => {
    const found = codes.find(c => c.long_description === k);
    RESERVED_COLOUR_MAP[k] = found?.code;
  })
  return RESERVED_COLOUR_MAP;
}

/**
 *
 * @param feature
 * @returns
 */
const getFillColorByStatus = (feature: ITelemetryFeature, colors: Record<string, string>, selected = false): string => {
  if (selected) {
    return colors['selected point'];
  }
  if (!feature) {
    return colors['default point']
  }
  const { properties } = feature;
  if (properties?.animal_status === 'Mortality') {
    return colors['potential mortality'];
  } else if (properties?.device_status === 'Potential Mortality') {
    return colors['potential malfunction'];
  }
  return properties?.animal_colour ?? colors['default point'];
};

/**
 *
 * @param layer
 * @param selected
 */
const fillPoint = (layer: any, colors: Record<string, string>, selected = false): void => {
  layer.setStyle({
    class: selected ? 'selected-ping' : '',
    weight: 1.0,
    fillColor: getFillColorByStatus(layer.feature, colors, selected)
  });
};

/**
 *
 * @param features
 * @param sortOption
 * @returns
 */
const groupFeaturesByCritters = (features: ITelemetryFeature[], sortOption?: DetailsSortOption): IUniqueFeature[] => {
  const uniques: IUniqueFeature[] = [];
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
  // sorted.forEach(d => console.log(`critter ${d.critter_id} device ${d.device_id}`));
  return sorted;
};

/**
 *
 * @param filters
 * @returns
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
 *
 * @param groupedFilters
 * @param features
 * @returns
 */
const applyFilter = (groupedFilters: IGroupedCodeFilter[], features: ITelemetryFeature[]): ITelemetryFeature[] => {
  return features.filter((f) => {
    const { properties } = f;
    for (let i = 0; i < groupedFilters.length; i++) {
      const { code_header, descriptions } = groupedFilters[i];
      if (!descriptions.includes(properties[code_header])) {
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
 * @param u list of grouped features
 * @returns flattened list of feature IDs 
 */
const flattenUniqueFeatureIDs = (u: IUniqueFeature[]): number[] => {
  return u.map(uf => uf.features.map(f => f.id)).flatMap(x => x);
}

const getUniqueCritterIDsFromFeatures = (features: ITelemetryFeature[], selectedIDs: number[]): string[] => {
  const grped = groupFeaturesByCritters(features.filter(f => selectedIDs.includes(f.id)));
  return grped.map(g => g.critter_id);
}

const getFeaturesFromGeoJSON = (obj: L.GeoJSON): ITelemetryFeature[] => {
  // fixme: why isn't feature a property of Layer??
  const features = obj.getLayers().map(d => (d as any)?.feature as ITelemetryFeature);
  return features;
}

const getLatestTelemetryFeature = (details: ITelemetryFeature[]): ITelemetryFeature => {
  return details.reduce((accum, current) => {
    return dayjs(current.properties.date_recorded).isAfter(dayjs(accum.properties.date_recorded)) ? current : accum
  });
}

export {
  RESERVED_COLOUR_MAP,
  fillPoint,
  applyFilter,
  flattenUniqueFeatureIDs,
  getFillColorByStatus,
  getUniqueCritterIDsFromFeatures,
  groupFeaturesByCritters,
  groupFilters,
  sortGroupedFeatures,
  getFeaturesFromGeoJSON,
  getLatestTelemetryFeature,
  createColoursConst,
};
