import { Type, Expose, Transform } from 'class-transformer';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import { GeoJsonObject, LineString, Point, Position } from 'geojson';
import { ICollectionUnit, ICritterTelemetryBase, eCritterStatus } from 'types/animal';
import { ICollarTelemetryBase } from 'types/collar';
import { columnToHeader, headerToColumn } from 'utils/common_helpers';
import { dateObjectToDateStr } from 'utils/time';
import {
  BCTWBase,
  BCTWType,
  DayjsToPlain,
  getCollectionUnitKeys,
  getCollectionUnitProps,
  nullOrDayjs,
  toClassOnly,
  toPlainOnly
} from './common_types';
import { Dayjs } from 'dayjs';

interface MapRange {
  start: string;
  end: string;
}

type OnlySelectedCritters = {
  show: boolean;
  critter_ids: string[];
};

type PingGroupType = 'critter_id' | 'collar_id';
type DetailsSortOption = 'wlh_id' | 'device_id' | 'frequency' | 'date_recorded';
type OnPanelRowSelect = (ids: number[]) => void;
type OnMapRowCellClick = (type: BCTWType, row: ITelemetryDetail) => void;

interface ITelemetryDetail extends ICollarTelemetryBase, ICritterTelemetryBase {
  critter_id: string;
  mortality_date: Date;
  date_recorded: Date;
  device_vendor: string;
}

interface ITelemetryPoint extends GeoJsonObject {
  type: 'Feature';
  geometry: Point;
  id: number;
  properties: TelemetryDetail;
}

// represents a track
interface ITelemetryLine extends GeoJsonObject {
  type: 'Feature';
  properties: Pick<ITelemetryDetail, 'critter_id' | 'collection_units' | 'taxon' | 'map_colour'>;
  geometry: LineString;
}

interface IUnassignedTelemetryLine extends GeoJsonObject {
  type: 'Feature';
  properties: Pick<ITelemetryDetail, 'collar_id' | 'device_id'>;
  geometry: LineString;
}

// a grouped by critter_id version of @type {ITelemetryPoint}
interface ITelemetryGroup {
  collar_id: string;
  critter_id: string;
  device_id: number;
  frequency: number;
  count: number;
  features: ITelemetryPoint[];
}

// represents the jsonb object in the get_telemetry pg function
// * Instantiate this class with createFlattenedProxy() to expose collection_units dynamically
export class TelemetryDetail implements ITelemetryDetail, BCTWBase<TelemetryDetail> {
  critter_id: string;
  taxon: string;
  wlh_id: string;
  animal_id: string;
  @Type(() => Date) capture_date: Date;
  sex: string;
  collection_units: ICollectionUnit[];
  collar_id: string;
  device_id: number;
  device_vendor: string;
  elevation: number;
  frequency: number;
  frequency_unit: string;
  device_status: string;
  collective_unit: string;
  @Transform(nullOrDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_timestamp: Dayjs;
  @Type(() => Date) date_recorded: Date;
  @Type(() => Date) mortality_date: Date;
  @Expose() get formattedDevice(): string {
    return `${this.device_id} (${this.device_vendor}) `;
  }
  @Expose() get formattedDate(): string {
    return dateObjectToDateStr(this.date_recorded);
  }
  @Expose() get formattedCaptureDate(): string {
    return this.capture_date ? dateObjectToDateStr(this.capture_date) : '';
  }
  @Expose() get paddedFrequency(): string {
    return this.frequency ? padFrequency(this.frequency) : '';
  }
  map_colour: string;

  toJSON(): TelemetryDetail {
    return this;
  }
  get identifier(): keyof TelemetryDetail {
    return 'device_id';
  }

  // Getter for properties in collection_units
  get collectionUnitProps(): Record<string, string> {
    return getCollectionUnitProps(this.collection_units);
  }

  // Getter to return the keys of the new properties
  get collectionUnitKeys(): string[] {
    return getCollectionUnitKeys(this.collection_units);
  }

  get critter_status(): string {
    return this.mortality_timestamp ? eCritterStatus.mortality : eCritterStatus.alive;
  }

  get displayProps(): (keyof TelemetryDetail)[] {
    return [];
  }

  formatPropAsHeader(str: string): string {
    return columnToHeader(str);
  }
}

export class TelemetryFeature implements ITelemetryPoint {
  type: 'Feature';
  id: number;
  geometry: GeoJSON.Point;
  properties: TelemetryDetail;
  @Expose() get location(): string {
    const lat = `+${+this.geometry.coordinates[1].toFixed(2)}\xb0`;
    const long = `${+this.geometry.coordinates[0].toFixed(2)}\xb0`;
    return `${lat} ${long}`;
  }
}

// determines if a single coordinate array can be found in a group of coordinates
const doesPointArrayContainPoint = (pings: Position[], coord: Position): boolean => {
  for (let i = 0; i < pings.length; i++) {
    const ping = pings[i];
    if (ping[0] === coord[0] && ping[1] === coord[1]) {
      return true;
    }
  }
  return false;
};

const padFrequency = (num: number): string => {
  const freq = num.toString();
  const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
  const numToAdd = 3 - numDecimalPlaces + freq.length;
  return freq.padEnd(numToAdd, '0');
};

// type Symbolize = {
//   item: ISelectMultipleData;
//   colour: string;
//   pointCount: number;
// };
type MapFormValue = {
  header: keyof TelemetryDetail | string;
  label: string;
  values: ISelectMultipleData[];
};

export const DEFAULT_MFV: MapFormValue = {
  header: 'device_id',
  label: 'Device ID (Default)',
  values: []
};

export type {
  ITelemetryDetail,
  MapRange,
  OnMapRowCellClick,
  OnPanelRowSelect,
  DetailsSortOption,
  OnlySelectedCritters,
  ITelemetryLine,
  ITelemetryPoint,
  ITelemetryGroup,
  PingGroupType,
  MapFormValue
};

export { doesPointArrayContainPoint };
