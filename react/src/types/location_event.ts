import { columnToHeader } from 'utils/common';
import { BCTW } from './common_types';
import { eInputType, FormFieldObject } from './form_types';

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
  get formFields(): FormFieldObject<LocationEvent>[] {
    return [
      {prop: 'date', type: eInputType.date },
      {prop: 'latitude', type: eInputType.number },
      {prop: 'longitude', type: eInputType.number },
      {prop: 'utm_easting', type: eInputType.number },
      {prop: 'utm_northing', type: eInputType.number },
      {prop: 'utm_zone', type: eInputType.number },
      {prop: 'comment', type: eInputType.text},
    ]
  }
}

export type { LocationEventType };
export { LocationEvent }
