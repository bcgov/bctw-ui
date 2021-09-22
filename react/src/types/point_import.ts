import { Type, Expose, Exclude } from 'class-transformer';
import { Point } from 'geojson';
import { BCTWValidDates } from 'types/common_types';
import { ITelemetryDetail } from 'types/map';
import { formatLatLong } from 'utils/common_helpers';

/**
 * types used to bulk import historical telemetry
*/

// what the API endpoint expects a historical telemetry point object to look like
export type IHistoricalTelemetryInput = Pick<ITelemetryDetail, 'device_id' | 'date_recorded' | 'device_vendor'> & {
  latitude: number;
  longitude: number;
};

// this class only exists to help create the import template
export class HistoricalTelemetryInput implements IHistoricalTelemetryInput, BCTWValidDates {
  device_id: number;
  @Type(() => Date) date_recorded: Date;
  device_vendor: string;
  latitude: number;
  longitude: number;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
}

/**
 * The expected response object interface returned from a successful historical point import.
 * The only difference being that lat/long are converted to the Postgres geometry type
 */
export interface IHistoricalTelemetry
  extends Omit<IHistoricalTelemetryInput, 'latitude' | 'longitude'>,  BCTWValidDates {
  geom: Point;
}

const opts = { toPlainOnly: true } ;

/**
 * custom tables don't (currently) render objects. ex. it expects all cell values to
 * be basic primitive types.
 * 
 * the import page converts the API response to a class @function plainToClass
 * to expose the @method {coords} getter, and then back to a plain object
 * to "remove" the @property {geom}.
 */
export class HistoricalTelemetry implements IHistoricalTelemetry {
  @Exclude(opts)geom: Point;
  device_id: number;
  @Type(() => Date) date_recorded: Date;
  device_vendor: string;
  @Exclude(opts)@Type(() => Date) valid_from: Date;
  @Exclude(opts)@Type(() => Date) valid_to: Date;
  @Expose() get coords(): string {
    return this.geom ? formatLatLong(this.geom.coordinates[0], this.geom.coordinates[1]) : '';
  }
}

export const isHistoricalTelemetry = (o: unknown): o is HistoricalTelemetryInput => {
  const r = o as HistoricalTelemetry;
  return !!(r.geom && r.device_id);
}
