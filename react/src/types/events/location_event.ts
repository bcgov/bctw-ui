import dayjs, { Dayjs } from 'dayjs';
// import { columnToHeader } from 'utils/common_helpers';
// import { BCTWEvent } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';

export type LocationEventType = 'capture' | 'mortality' | 'release' | 'retrieval' | 'malfunction';
interface IBaseLocationEvent {
  // location_type: LocationEventType;
  date: Dayjs;
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;
}

export class LocationEvent implements IBaseLocationEvent {
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;

  constructor(private location_type: LocationEventType, public date: Dayjs = dayjs()) {
    this.utm_easting = 0;
    this.utm_northing = 0;
    this.utm_zone = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.comment = '';
  }

  toJSON(): Record<string, unknown> {
    const o = {};
    for (const k in this) {
      const key = `${this.location_type}_${k}`;
      o[key] = this[k];
    }
    return o;
  }

  formatPropAsHeader(str: keyof LocationEvent): string {
    const withType = `${this.location_type}_${str}`.replace('utm', 'UTM');
    return columnToHeader(withType);
  }

  get fields(): Record<string, FormFieldObject<LocationEvent> | FormFieldObject<LocationEvent>[]> {
    return {
      date: { prop: 'date', type: eInputType.datetime, required: true },
      latlon: [
        { prop: 'latitude', type: eInputType.number },
        { prop: 'longitude', type: eInputType.number }
      ],
      utm: [
        { prop: 'utm_easting', type: eInputType.number },
        { prop: 'utm_northing', type: eInputType.number },
        { prop: 'utm_zone', type: eInputType.number }
      ],
      comment: { prop: 'comment', type: eInputType.text }
    };
  }
}
