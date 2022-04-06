import { Transform } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import { Animal } from 'types/animal';
import { Collar, IAttachedCollar } from 'types/collar';
import { BCTWBase, BCTWValidDates, nullToDayjs, uuid } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { formatDay } from 'utils/time';

import { Code } from 'types/code';
import { DataLife } from 'types/data_life';
import { editObjectToEvent } from './events/event';
import { eCritterPermission } from './permission';

// telemetry alerts types
export enum eAlertType {
  battery = 'battery',
  malfunction = 'malfunction',
  mortality = 'mortality'
}

export interface ITelemetryAlert extends BCTWValidDates, Required<Pick<IAttachedCollar, 'last_transmission_date'>> {
  alert_id: number;
  alert_type: eAlertType;
  snoozed_to: Dayjs;
  snooze_count: number;
}

type AlertProp = keyof ITelemetryAlert;

/**
 * base class for user telemetry alerts.
 */
export class TelemetryAlert implements DataLife, ITelemetryAlert, BCTWBase<ITelemetryAlert> {
  alert_id: number;
  alert_type: eAlertType;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;
  @Transform(nullToDayjs) snoozed_to: Dayjs;
  @Transform(nullToDayjs) last_transmission_date: Dayjs;
  snooze_count: number;
  permission_type: eCritterPermission;
  @Transform(nullToDayjs) attachment_start: Dayjs;
  @Transform(nullToDayjs) attachment_end: Dayjs;
  @Transform(nullToDayjs) data_life_start: Dayjs;
  @Transform(nullToDayjs) data_life_end: Dayjs;

  get displayProps(): (keyof ITelemetryAlert)[] {
    return [];
  }
  get isSnoozed(): boolean {
    return dayjs().isBefore(dayjs(this.snoozed_to));
  }
  get isEditor(): boolean {
    return this.permission_type == eCritterPermission.editor;
  }
  get identifier(): keyof TelemetryAlert {
    return 'alert_id';
  }
  get snoozesMax(): number {
    return 3;
  }
  get snoozesAvailable(): number {
    return this.snoozesMax - this.snooze_count;
  }
  get snoozeStatus(): string {
    // const usedSofar = `(${this.snooze_count} used)`;
    if (this.isSnoozed) {
      // return `snoozed until ${dayjs(this.snoozed_to).format(formatDay)} ${usedSofar}`;
      return `snoozed until ${dayjs(this.snoozed_to).format(formatDay)}`;
    } else {
      // return `${this.snoozesAvailable} snoozes available ${usedSofar}`;
      return `${this.snoozesAvailable} snoozes available`;
    }
  }
  get formatAlert(): string {
    switch (this.alert_type) {
      case eAlertType.mortality:
        return 'Potential Mortality';
      case eAlertType.battery:
        return 'Low Battery';
      case eAlertType.malfunction:
        return 'Potential Malfunction';
      default:
        return 'unknown';
    }
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'valid_from':
        return 'Notification Time';
      case 'last_transmission_date':
        return 'Last Transmission';
      default:
        return columnToHeader(str);
    }
  }

  performSnooze(): TelemetryAlert {
    this.snooze_count++;
    // const curSnooze = this.snoozed_to.isValid() ? this.snoozed_to : dayjs();
    this.snoozed_to = dayjs().add(1, 'day');
    return this;
  }

  expireAlert(): TelemetryAlert {
    /**
     * fixme: if the alert is being expired, set the valid_to to
     * before now for the invalidation to work properly
     */
    this.valid_to = dayjs().subtract(1, 'minute');
    return this;
  }

  toJSON(): Pick<TelemetryAlert, 'alert_id' | 'valid_to' | 'snooze_count' | 'snoozed_to'> {
    const ret = new TelemetryAlert();
    ret.alert_id = this.alert_id;
    ret.valid_to = this.valid_to;
    ret.snooze_count = this.snooze_count;
    ret.snoozed_to = this.snoozed_to;
    return ret;
  }

  static get displayableAlertProps(): AlertProp[] {
    return ['alert_type'];
  }
}

// props that any mortality event or alert should have.
export interface IMortalityAlert
  extends Pick<Collar, 'collar_id' | 'device_id' | 'device_make' | 'device_status'>,
  Pick<Animal, 'critter_id' | 'animal_id' | 'animal_status' | 'wlh_id' | 'captivity_status' | 'species'>,
  DataLife {}

type MortalityAlertProp = keyof IMortalityAlert;
/**
 * the mortality workflow event can be triggered from
 * an alert and the animal metadata page
 */
export class MortalityAlert extends TelemetryAlert implements IMortalityAlert {
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  device_status: Code;

  critter_id: uuid;
  animal_id: string;
  animal_status: Code;
  captivity_status: boolean;
  wlh_id: string;
  species: string;

  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;
  

  static get displayableMortalityAlertProps(): (AlertProp | MortalityAlertProp)[] {
    return ['wlh_id', 'animal_id','species', 'device_id', 'device_make', ...TelemetryAlert.displayableAlertProps, 'valid_from', 'last_transmission_date'];
  }

  formatPropAsHeader(s: string): string {
    return super.formatPropAsHeader(s);
  }

  toWorkflow<T>(workflow: T): T {
    // don't preserve animal status from the alert.
    return editObjectToEvent(this, workflow, ['animal_status']);
  }
}

/**
 * the missing data alert is triggered when telemetry has not been received 
 * from a device for more than a certain time period (default 7 days). 
 * The missing data event triggers the device malfunction workflow
 */
export class MalfunctionAlert extends MortalityAlert {
  toWorkflow<T>(workflow: T): T {
    return editObjectToEvent(this, workflow, ['device_status']);
  }
}
