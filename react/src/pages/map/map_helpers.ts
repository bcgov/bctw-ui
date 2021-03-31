import { ICodeFilter, IGroupedCodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryDetail, ITelemetryFeature, IUniqueFeature } from 'types/map';

const COLORS = {
  potential: '#FF8C00',
  dead: '#ff0000',
  normal: '#00ff44',
  selected: '#ffff00'
};

/**
 *
 * @param feature
 * @returns
 */
const getFillColorByStatus = (feature: ITelemetryFeature): string => {
  const a = feature?.properties?.animal_status;
  const d = feature?.properties?.device_status;
  if (a === 'Mortality') {
    return COLORS.dead;
  } else if (d === 'Potential Mortality') {
    return COLORS.potential;
  }
  return COLORS.normal;
};

/**
 *
 * @param layer
 * @param selected
 */
const fillPoint = (layer: any, selected = false): void => {
  layer.setStyle({
    class: selected ? 'selected-ping' : '',
    weight: 1.0,
    fillColor: selected ? COLORS.selected : getFillColorByStatus(layer.feature)
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

export {
  COLORS,
  fillPoint,
  applyFilter,
  flattenUniqueFeatureIDs,
  getFillColorByStatus,
  getUniqueCritterIDsFromFeatures,
  groupFeaturesByCritters,
  groupFilters,
  sortGroupedFeatures
};
