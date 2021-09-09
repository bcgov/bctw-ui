import { Type } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, BCTWValidDates, uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { formatDay, formatTime } from 'utils/time';

import { Code } from 'types/code';
import { DataLife } from 'types/data_life';
import MortalityEvent from 'types/events/mortality_event';

// possible types of telemetry alerts
enum eAlertType {
  battery = 'battery',
  mortality = 'mortality'
}

interface ITelemetryAlert extends BCTWValidDates {
  alert_id: number;
  alert_type: eAlertType;
  snoozed_to: Date;
  snooze_count: number;
}

type AlertProp = keyof ITelemetryAlert;

export class TelemetryAlert extends BCTWBase implements ITelemetryAlert {
  alert_id: number;
  alert_type: eAlertType;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Type(() => Date) snoozed_to: Date;
  snooze_count: number;

  get isSnoozed(): boolean {
    return dayjs().isBefore(dayjs(this.snoozed_to));
  }
  get identifier(): string {
    return 'alert_id';
  }
  get snoozesMax(): number {
    return 3;
  }
  get snoozesAvailable(): number {
    return this.snoozesMax - this.snooze_count;
  }
  get snoozeStatus(): string {
    const usedSofar = `(${this.snooze_count} used)`;
    if (this.isSnoozed) {
      return `snoozed until ${dayjs(this.snoozed_to).format(formatDay)} ${usedSofar}`;
    } else {
      return `${this.snoozesAvailable} snoozes available ${usedSofar}`;
    }
  }
  get formatAlert(): string {
    switch (this.alert_type) {
      case eAlertType.mortality:
        return 'Potential Mortality';
      case eAlertType.battery:
        return 'Low Battery';
      default:
        return 'unknown';
    }
  }

  formatPropAsHeader(str: keyof TelemetryAlert): string {
    switch (str) {
      case 'valid_from':
        return 'Notification Time';
      default:
        return columnToHeader(str);
    }
  }

  performSnooze(): TelemetryAlert {
    this.snooze_count++;
    const curSnooze: Dayjs = dayjs(this.snoozed_to ?? dayjs());
    this.snoozed_to = curSnooze.add(1, 'day').toDate();
    return this;
  }
  expireAlert(): TelemetryAlert {
    this.valid_to = new Date();
    return this;
  }

  toJSON(): TelemetryAlert {
    return {
      alert_id: this.alert_id,
      valid_to: this.valid_to === null ? null : dayjs().subtract(1, 'hour').format(formatTime),
      snooze_count: this.snooze_count,
      snoozed_to: this.snoozed_to === null ? null : dayjs(this.snoozed_to).format(formatTime)
    } as unknown as TelemetryAlert;
  }

  static get displayableAlertProps(): AlertProp[] {
    return ['alert_type'];
  }
}

// props that any mortality event or alert should have.
export interface IMortalityAlert extends 
  Pick<Collar, | 'collar_id' | 'device_id' | 'device_make'>,
  Pick<Animal, 'critter_id' | 'animal_id' | 'animal_status' | 'wlh_id'>,
  DataLife {}

type MortalityAlertProp = keyof IMortalityAlert;
/**
 * the mortality event is unique in that it is the only workflow that is both triggered from
 * an alert and a workflow (ex. it can be initiated from the animal metadata page)
 */
export class MortalityAlert extends TelemetryAlert implements IMortalityAlert {
  collar_id: uuid;
  device_id: number;
  device_make: Code;

  critter_id: uuid;
  animal_id: string;
  animal_status: Code;
  wlh_id: string;

  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  static get displayableMortalityAlertProps(): (AlertProp|MortalityAlertProp)[] {
    return ['wlh_id', 'animal_id', 'device_id', 'device_make', ...TelemetryAlert.displayableAlertProps, 'valid_from'];
  }

  formatPropAsHeader(s: AlertProp | string): string {
    return super.formatPropAsHeader(s as AlertProp);
  }

  toMortalityEvent(): MortalityEvent {
    return Object.assign(new MortalityEvent(), this);
  }
}

export type { eAlertType, ITelemetryAlert };
