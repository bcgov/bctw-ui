import { FormStrings } from 'constants/strings';
import dayjs from 'dayjs';
import { ICodeFilter, IGroupedCodeFilter } from 'types/code';
import {
  DetailsSortOption,
  ITelemetryDetail,
  ITelemetryPoint,
  ITelemetryGroup,
  ITelemetryLine,
  doesPointArrayContainPoint,
  PingGroupType
} from 'types/map';

const MAP_COLOURS = {
  point: '#00ff44',
  track: '#00a9e6',
  selected: '#ffff00',
  'selected polygon': '#00a9e6',
  'unassigned point': '#b2b2b2',
  'unassigned line segment': '#828282',
  malfunction: '#ffaa00',
  mortality: '#e60000',
  outline: '#fff'
};

const MAP_COLOURS_OUTLINE = {
  point: '#686868',
  selected: '#000000',
  'unassigned point': '#686868',
  malfunction: '#000000',
  mortality: '#ffaa00'
};

/**
 * @param colourString the @type {Animal} animal_colour string
 * which in the @file {map_api.ts} -> @function {getPings} is returned
 * in a concatted format of `${fill_collour},${border_colour}`
 * @returns an object with point border and fill colours
 */
const parseAnimalColour = (colourString: string): { fillColor: string; color: string } => {
  if (!colourString) {
    return { fillColor: MAP_COLOURS['unassigned point'], color: MAP_COLOURS['unassigned point'] };
  }
  const s = colourString.split(',');
  return { fillColor: s[0], color: s[1] };
};

/**
 * @returns the hex colour value to show as the fill colour
 */
const getFillColorByStatus = (point: ITelemetryPoint, selected = false): string => {
  if (selected) {
    return MAP_COLOURS.selected;
  }
  if (!point) {
    return MAP_COLOURS.point;
  }
  const { properties } = point;
  if (properties?.animal_status === 'Mortality') {
    return MAP_COLOURS.mortality;
  } else if (properties?.device_status === 'Potential Mortality') {
    return MAP_COLOURS.malfunction;
  }
  return parseAnimalColour(properties.animal_colour)?.fillColor ?? MAP_COLOURS.point;
};

// same as getFillColorByStatus - but for the point border/outline color
const getOutlineColor = (feature: ITelemetryPoint): string => {
  if (feature.id < 0) {
    return MAP_COLOURS_OUTLINE['unassigned point'];
  }
  const colour = feature?.properties?.animal_colour;
  return colour ? parseAnimalColour(colour)?.color : MAP_COLOURS.outline;
};

/**
 * sets the @param layer {setStyle} function
 */
const fillPoint = (layer: any, selected = false): void => {
  // dont style tracks or invalid points
  if (!layer.feature || layer.feature?.geometry?.type === 'LineString' || typeof layer.setStyle !== 'function') {
    return;
  }
  layer.setStyle({
    class: selected ? 'selected-ping' : '',
    weight: 1.0,
    color: getOutlineColor(layer.feature),
    fillColor: getFillColorByStatus(layer.feature, selected)
  });
};

/**
 * @param pings list of telemetry features to group
 * @param sortOption applied after the features are gruped by critter_id
 * @returns @type {ITelemetryGroup}
 */
const groupPings = (
  pings: ITelemetryPoint[],
  sortOption?: DetailsSortOption,
  groupBy: PingGroupType = 'critter_id',
): ITelemetryGroup[] => {
  const uniques: ITelemetryGroup[] = [];
  if (!pings.length) {
    return uniques;
  }
  // filter out the (0,0) points
  const filtered = pings.filter((f) => {
    const coords = f.geometry.coordinates;
    return coords[0] !== 0 && coords[1] !== 0;
  });
  filtered.forEach((f) => {
    const detail: ITelemetryDetail = f.properties;
    const found = uniques.find((c) => c[groupBy] === detail[groupBy]);
    if (!found) {
      uniques.push({
        collar_id: detail.collar_id,
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
const applyFilter = (groupedFilters: IGroupedCodeFilter[], features: ITelemetryPoint[]): ITelemetryPoint[] => {
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
 * @returns the sorted @type {ITelemetryGroup}
 */
function sortGroupedTelemetry(array: ITelemetryGroup[], comparator: (a, b) => number): ITelemetryGroup[] {
  const stabilizedThis = array.map((el, idx) => [el.features[0].properties, idx] as [ITelemetryDetail, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  const identifiers = stabilizedThis.map((a) => a[0].device_id /* a[0].critter_id ?? a[0].collar_id */);
  const ret = [];
  for (let i = 0; i < identifiers.length; i++) {
    const foundIndex = array.findIndex((a) => a.device_id /*a.critter_id ?? a.collar_id*/ === identifiers[i]);
    ret.push(array[foundIndex]);
  }
  return ret;
}

/**
 * @param u list of grouped features @type {ITelemetryGroup}
 * @returns unique feature IDs within the group
 */
const getPointIDsFromTelemetryGroup = (u: ITelemetryGroup[]): number[] => {
  return u.map((uf) => uf.features.map((f) => f.id)).flatMap((x) => x);
};

/**
 * groups features by @property {critter_id}, and returns an array of unique critter_ids
 */
const getUniqueCritterIDsFromSelectedPings = (features: ITelemetryPoint[], selectedIDs: number[]): string[] => {
  const grped = groupPings(features.filter((f) => selectedIDs.includes(f.id)));
  return grped.map((g) => g.critter_id);
};

const getUniqueDevicesFromPings = (features: ITelemetryPoint[]): number[] => {
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
 * @returns a single feature that contains the most recent date_recorded
 */
const getLatestPing = (features: ITelemetryPoint[]): ITelemetryPoint => {
  return features.reduce((accum, current) => {
    return dayjs(current.properties.date_recorded).isAfter(dayjs(accum.properties.date_recorded)) ? current : accum;
  });
};

/**
 * @returns a single feature that contains the oldest date_recorded
 */
const getEarliestPing = (features: ITelemetryPoint[]): ITelemetryPoint => {
  return features.reduce((accum, current) => {
    return dayjs(current.properties.date_recorded).isBefore(dayjs(accum.properties.date_recorded)) ? current : accum;
  });
};

// groups the param features by critter, returning an object containing:
// an array of the most recent pings
// an arrya of all other pings
const splitPings = (pings: ITelemetryPoint[], splitBy: PingGroupType = 'critter_id'): { latest: ITelemetryPoint[]; other: ITelemetryPoint[] } => {
  const gp = groupPings(pings, null, splitBy);
  const latest = getLatestPingsFromTelemetryGroup(gp);
  const latestIds = latest.map((l) => l.id);
  const other = pings.filter((p) => !latestIds.includes(p.id));
  return { latest, other };
};

// returns an array of the latest ping for each telemetry group
const getLatestPingsFromTelemetryGroup = (grouped: ITelemetryGroup[]): ITelemetryPoint[] => {
  const latestPings = [];
  grouped.forEach((g) => {
    latestPings.push(getLatestPing(g.features));
  });
  return latestPings;
};

/**
 * @returns an object containing the most recent 9?10? pings and tracks
 */
const getLast10Fixes = (
  pings: ITelemetryPoint[],
  tracks: ITelemetryLine[]
): { pings: ITelemetryPoint[]; tracks: ITelemetryLine[] } => {
  const pingsGroupedByCritter = groupPings(pings);
  const newPings = getLast10Points(pingsGroupedByCritter);
  const newTracks = getLast10Tracks(groupPings(newPings), tracks);
  return {
    pings: newPings,
    tracks: newTracks
  };
};

// returns the most recent 9 telemetry points per critter group
// 9 instead of 10 as the latest ping is stored in a separate layer
const getLast10Points = (pings: ITelemetryGroup[]): ITelemetryPoint[] => {
  const p = [];
  for (let i = 0; i < pings.length; i++) {
    const features = pings[i].features;
    const sorted = features.sort((a, b) => {
      return new Date(b.properties.date_recorded).getTime() - new Date(a.properties.date_recorded).getTime();
    });
    const last10 = sorted.filter((s, idx) => idx > 0 && idx <= 10);
    p.push(...last10);
  }
  return p;
};

/**
 *
 * @param groupedPings critter groups - assumes pings have already been filtered to the last 10 fixes
 * @param originalTracks - unaltered API fetched tracks
 * @returns a new array of @type {ITelemetryLine} where the @property {geometry} coordinates
 * are filtered to only those contained in the ping
 *
 * note: for a given critter/date_recorded, a @property {ITelemetryLine.geometry.coordinates}
 * is the same as @property {ITelemetryPoint.geometry.coordinates},
 * the only difference is how Leaflet displays them!
 */
const getLast10Tracks = (
  groupedPings: ITelemetryGroup[],
  originalTracks: ITelemetryLine[]
): ITelemetryLine[] => {
  const newTracks: ITelemetryLine[] = [];
  groupedPings.forEach((e) => {
    const critterPingCoordinates = e.features.map((p) => p.geometry.coordinates);
    const matchingTrack = originalTracks.find((t) => t.properties.critter_id === e.critter_id);
    if (!matchingTrack) {
      return;
    }
    const matchingTrackCoords = matchingTrack.geometry.coordinates;
    const filteredTrackCoords = matchingTrackCoords.filter((c) =>
      doesPointArrayContainPoint(critterPingCoordinates, c)
    );

    const newTrack = Object.assign({}, matchingTrack);
    newTrack.geometry = { type: matchingTrack.geometry.type, coordinates: filteredTrackCoords };

    newTracks.push(newTrack);
  });
  return newTracks;
};

export {
  applyFilter,
  fillPoint,
  getPointIDsFromTelemetryGroup,
  getEarliestPing,
  getOutlineColor,
  getFillColorByStatus,
  getLatestPingsFromTelemetryGroup,
  getLast10Fixes,
  getLast10Points,
  getLast10Tracks,
  getLatestPing,
  getUniqueCritterIDsFromSelectedPings,
  getUniqueDevicesFromPings,
  groupPings,
  groupFilters,
  MAP_COLOURS,
  MAP_COLOURS_OUTLINE,
  parseAnimalColour,
  sortGroupedTelemetry,
  splitPings,
};
