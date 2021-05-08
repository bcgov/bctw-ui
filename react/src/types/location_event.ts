import { columnToHeader } from 'utils/common';
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
  constructor(type: LocationEventType, d: Date) {
    this.locationType = type;
    this.utm_easting = 0;
    this.utm_northing = 0;
    this.utm_zone = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.date = d ?? new Date();
    this.comment = '';
  }
  formatPropAsHeader(str: string): string {
    const withType = `${this.locationType}_${str}`.replace('utm', 'UTM');
    return columnToHeader(withType);
  }
}

export type { LocationEventType };
export { LocationEvent }
