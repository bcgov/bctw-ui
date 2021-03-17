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
const filterFeatures = (groupedFilters: IGroupedCodeFilter[], features: ITelemetryFeature[]): ITelemetryFeature[] => {
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

export { COLORS, fillPoint, filterFeatures, getFillColorByStatus, groupFeaturesByCritters, groupFilters };
