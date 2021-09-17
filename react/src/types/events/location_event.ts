import dayjs, { Dayjs } from 'dayjs';
import { eInputType, FormFieldObject } from 'types/form_types';
import { columnToHeader } from 'utils/common_helpers';
import { EventType } from 'types/events/event';
import { formatTime } from 'utils/time';

export enum eLocationPositionType {
  utm  = 'utm',
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
  coordinate_type: eLocationPositionType;
  comment: string;
  latitude: number;
  longitude: number;
  utm_easting: number;
  utm_northing: number;
  utm_zone: number;

  constructor(private location_type: EventType, public date: Dayjs = dayjs()) {
    this.coordinate_type = eLocationPositionType.utm
  }

  private readonly utm_keys: (keyof this)[] = ['utm_easting', 'utm_northing', 'utm_zone'];
  private readonly coord_keys: (keyof this)[] = ['latitude', 'longitude'];
  private readonly json_keys: (keyof this)[]= [...this.utm_keys, ...this.coord_keys, 'comment', 'date'];

  // todo: could use template literal type?
  toJSON(): Record<string, unknown> {
    const o = {};
    for (let i = 0; i < this.json_keys.length; i++) {
      const cur = this.json_keys[i];
      if (this.coordinate_type === 'utm' && this.coord_keys.includes(cur)) {
        continue;
      } else if (this.coordinate_type === 'coord' && this.utm_keys.includes(cur)) {
        continue;
      }
      const key = `${this.location_type}_${cur}`;
      o[key] = cur === 'date' ? this.date?.format(formatTime) : this[cur];
    }
    return o;
  }

  formatPropAsHeader(str: keyof LocationEvent): string {
    return columnToHeader(str.replace('utm', 'UTM'))
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
