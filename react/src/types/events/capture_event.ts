import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, OptionalDevice } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';

export default class CaptureEvent implements BCTWWorkflow<CaptureEvent> {
  readonly event_type: WorkflowType;
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
    this.event_type = 'capture';
  }

  formatPropAsHeader(s: string): string {
    switch (s) {
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof CaptureEvent)[] {
    return ['device_id']
  }
  getHeaderTitle(): string {
    return 'capture event '
  }

  getAnimal(): OptionalAnimal {
    return {};
  }

  getDevice(): OptionalDevice {
    return {};
  }
}
