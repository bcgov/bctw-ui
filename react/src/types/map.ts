import { Type, Expose } from 'class-transformer';
import { IAnimalTelemetryBase } from 'types/animal';
import { ICollarTelemetryBase } from 'types/collar';
import { columnToHeader } from 'utils/common';
// import { GeoJSON } from 'geojson';
import { formatWithUTCOffset } from 'utils/time';
import { BCTW, TypeWithData } from './common_types';

interface MapRange {
  start: string;
  end: string;
}

type DetailsSortOption = 'wlh_id' | 'device_id' | 'frequency' | 'date_recorded';
type OnPanelRowSelect = (ids: number[], filterMapSelection: boolean) => void;
type OnMapRowCellClick = (type: TypeWithData, row: ITelemetryDetail) => void;

interface ITelemetryDetail extends ICollarTelemetryBase, IAnimalTelemetryBase {
  critter_id: string;
  // critter_transaction_id: string;
  // collar_transaction_id: string;
  date_recorded: Date;
  device_vendor: string;
}

interface ITelemetryFeature extends GeoJSON.Feature {
  //  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: number[];
  };
  id: number;
  properties: ITelemetryDetail;
}

interface ITracksFeature extends GeoJSON.GeoJsonObject {
  // type: 'Feature';
  properties: Pick<ITelemetryDetail, 'critter_id' | 'population_unit' | 'species'>
}

/**
 * a grouped by critter_id version of @type {TelemetryFeature} 
 */
interface IUniqueFeature {
  critter_id: string;
  device_id: number;
  frequency: number;
  count: number;
  features: ITelemetryFeature[];
}

// represents the jsonb built object in the database get_telemetry call
export class TelemetryDetail implements BCTW, ITelemetryDetail {
  critter_id: string;
  species: string;
  wlh_id: string;
  animal_id: string;
  animal_status: string;
  @Type(() => Date) capture_date: Date;
  sex: string;
  population_unit: string;
  collar_id: string;
  device_id: number;
  device_vendor: string;
  frequency: number;
  device_status: string;
  location: string;
  @Type(() => Date) date_recorded: Date;
  @Expose() get formattedDevice(): string {
    return `${this.device_id} (${this.device_vendor}) `;
  }
  @Expose() get formattedDate(): string {
    return formatWithUTCOffset(this.date_recorded);
  }
  animal_colour: string;

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'wlh_id':
        return 'WLH ID';
      case 'animal_id':
        return 'Animal ID';
      case 'device_id':
        return 'Device ID';
      default:
        return columnToHeader(str);
    }
  }
}

export class TelemetryFeature implements ITelemetryFeature {
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

export type {
  ITelemetryFeature,
  ITracksFeature,
  ITelemetryDetail,
  IUniqueFeature,
  MapRange,
  OnMapRowCellClick,
  OnPanelRowSelect,
  DetailsSortOption,
};
