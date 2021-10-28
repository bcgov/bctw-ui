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
    public disable_date = false,
    public coordinate_type = eLocationPositionType.utm,
  ) {}

  utm_keys: (keyof this)[] = ['utm_easting', 'utm_northing', 'utm_zone'];
  coord_keys: (keyof this)[] = ['latitude', 'longitude'];
  private json_keys: (keyof this)[] = [...this.utm_keys, ...this.coord_keys, 'comment', 'date'];

  /**
   * returns the location event as a new object.
   * depending on the coordinate type used, removes the keys not in use 
   */
  toJSON(): Record<string, unknown> {
    const o = {};
    for (let i = 0; i < this.json_keys.length; i++) {
      const k = this.json_keys[i];
      if (k === 'date' && this.disable_date) {
        continue;
      }
      if (this.coordinate_type === 'utm' && this.coord_keys.includes(k)) {
        continue;
      } else if (this.coordinate_type === 'coord' && this.utm_keys.includes(k)) {
        continue;
      }
      const key = `${this.location_type}_${k}`;
      o[key] = this[k];
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
