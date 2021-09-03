import { Type, Expose, Transform } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, transformOpt } from 'types/common_types';
import dayjs, { Dayjs } from 'dayjs';
import { formatDay, formatTime } from 'utils/time';

// possible types of telemetry alerts
enum eAlertType {
  battery = 'battery',
  mortality = 'mortality'
}

// props inherited from BCTW types
type TelemetryAlertCollar = Pick<Collar, | 'collar_id' | 'device_id' | 'device_status'
| 'device_deployment_status' | 'retrieval_date' | 'retrieved' | 'activation_status'>;
type TelemetryAlertAnimal = Pick<Animal, | 'critter_id' | 'animal_id' | 'animal_status' | 'wlh_id'
| 'mortality_date' | 'mortality_latitude' | 'mortality_longitude' | 'mortality_utm_easting' | 'mortality_utm_northing' | 'mortality_utm_zone'>;

interface ITelemetryAlert extends TelemetryAlertAnimal, TelemetryAlertCollar {
  alert_id: number;
  alert_type: eAlertType;
  valid_from: Date;
  valid_to: Date;
  snoozed_to: Date;
  snooze_count: number;
}

export class TelemetryAlert extends BCTWBase implements ITelemetryAlert {
  activation_status: boolean;
  alert_id: number;
  alert_type: eAlertType;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Type(() => Date) snoozed_to: Date;
  snooze_count: number;
  collar_id: string;
  device_id: number;
  device_make: string;
  device_status: string;
  device_deployment_status: string;
  @Transform((v) => v || new Date(), transformOpt) retrieval_date: Date;
  @Transform((v) => v || false, transformOpt) retrieved: boolean;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  animal_status: string;
  @Transform((v) => v || new Date(), transformOpt) mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  @Expose() get isSnoozed(): boolean {
    return dayjs().isBefore(dayjs(this.snoozed_to));
  }
  @Expose() get identifier(): string {
    return 'alert_id';
  }
  @Expose() get snoozesMax(): number {
    return 3;
  }
  @Expose() get snoozesAvailable(): number {
    return this.snoozesMax - this.snooze_count;
  }
  @Expose() get snoozeStatus(): string {
    const usedSofar = `(${this.snooze_count} used)`;
    if (this.isSnoozed) {
      return `snoozed until ${dayjs(this.snoozed_to).format(formatDay)} ${usedSofar}`;
    } else {
      return `${this.snoozesAvailable} snoozes available ${usedSofar}`;
    }
  }
  @Expose() get formatAlert(): string {
    switch (this.alert_type) {
      case eAlertType.mortality:
        return 'Potential Mortality';
      case eAlertType.battery:
        return 'Low Battery';
      default:
        return 'unknown';
    }
  }

  static formatPropAsHeader(str: string): string {
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

  // for saving
  toJSON(): TelemetryAlert {
    return {
      alert_id: this.alert_id,
      valid_to: this.valid_to === null ? null : dayjs().subtract(1, 'hour').format(formatTime),
      snooze_count: this.snooze_count,
      snoozed_to: this.snoozed_to === null ? null : dayjs(this.snoozed_to).format(formatTime)
    } as unknown as TelemetryAlert;
  }

  formatPropAsHeader(str: keyof TelemetryAlert): string {
    return columnToHeader(str);
  }
}

export type { eAlertType, ITelemetryAlert };