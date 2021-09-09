import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { BCTWEvent } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';

export default class CaptureEvent extends BCTWEvent {
  collar_id: uuid;
  device_id: number;
  device_make: Code;

  // data life
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  location_event: LocationEvent;

  constructor() {
    super('capture');
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
      default:
        return columnToHeader(s);
    }
  }

  toJSON(): CaptureEvent {
    return this;
  }
}
