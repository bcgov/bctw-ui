import { columnToHeader } from 'utils/common';
import { Animal } from './animal';
import { BCTW } from './common_types';

type LocationEventType = 'capture' | 'mortality' | 'release' | 'retrieval' | 'malfunction';
interface IBaseLocationEvent {
  locationType: LocationEventType;
  date: Date;
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;
}

class LocationEvent implements BCTW, IBaseLocationEvent {
  locationType: LocationEventType;
  date: Date;
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;
  constructor(type: LocationEventType ) {
    this.locationType = type;
    this.utm_easting = 0;
    this.utm_northing = 0;
    this.utm_zone = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.date = new Date();
    this.comment = '';
  }
  formatPropAsHeader(str: string): string {
    return columnToHeader(str.replace('utm', 'UTM').substring(str.indexOf('_') + 1));
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IMortalityEvent extends Pick<Animal, | 'mortality_date' | 'mortality_comment' | 'mortality_latitude' | 'mortality_longitude' | 'mortality_utm_easting' | 'mortality_utm_northing' | 'mortality_utm_zone' > {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICaptureEvent extends Pick< Animal, | 'capture_date' | 'capture_comment' | 'capture_latitude' | 'capture_longitude' | 'capture_utm_easting' | 'capture_utm_northing' | 'capture_utm_zone' > {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IReleaseEvent extends Pick< Animal, | 'release_date' | 'release_comment' | 'release_latitude' | 'release_longitude' | 'release_utm_easting' | 'release_utm_northing' | 'release_utm_zone' > {}

export type { LocationEventType, ICaptureEvent, IMortalityEvent, IReleaseEvent };
export { LocationEvent }
