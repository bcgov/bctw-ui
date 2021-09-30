import dayjs, { Dayjs } from 'dayjs';
import { eInputType, FormFieldObject } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';
import { WorkflowType } from 'types/events/event';

export enum eLocationPositionType {
  utm = 'utm',
  coord = 'coord'
}

interface ILocationEvent {
  coordinate_type: eLocationPositionType;
  date: Dayjs;
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;
}

export class LocationEvent implements ILocationEvent {
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;

  constructor(
    private location_type: WorkflowType,
    public date: Dayjs = dayjs(),
    public coordinate_type = eLocationPositionType.utm
  ) {}

  private utm_keys: (keyof this)[] = ['utm_easting', 'utm_northing', 'utm_zone'];
  private coord_keys: (keyof this)[] = ['latitude', 'longitude'];
  private json_keys: (keyof this)[] = [...this.utm_keys, ...this.coord_keys, 'comment', 'date'];

  toJSON(): Record<string, unknown> {
    const o = {};
    for (let i = 0; i < this.json_keys.length; i++) {
      const value = this.json_keys[i];
      if (this.coordinate_type === 'utm' && this.coord_keys.includes(value)) {
        continue;
      } else if (this.coordinate_type === 'coord' && this.utm_keys.includes(value)) {
        continue;
      }
      const key = `${this.location_type}_${value}`;
      o[key] = this[value];
    }
    return o;
  }

  formatPropAsHeader(str: keyof LocationEvent): string {
    if (['date', 'comment'].includes(str)) {
      return columnToHeader(`${this.location_type}_${str}`);
    }
    return columnToHeader(str.replace('utm', 'UTM'));
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
