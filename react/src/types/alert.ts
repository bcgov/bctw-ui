import { Type, Expose, Transform } from 'class-transformer';
import { columnToHeader } from 'utils/common';
import { Animal, transformOpt } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTW } from 'types/common_types';

enum eAlertType {
  battery = 'battery',
  mortality = 'mortality'
}

type TelemetryAlertCollar = Pick<Collar, 
'collar_id' | 'device_id'| 'device_status'| 'device_deployment_status' | 'retrieval_date' | 'retrieved' | 'vendor_activation_status'>;
type TelemetryAlertAnimal = Pick<Animal, 
'critter_id' | 'animal_id' | 'animal_status' | 'wlh_id' | 'mortality_date' | 'mortality_latitude' | 'mortality_longitude' | 'mortality_utm_easting' | 'mortality_utm_northing' | 'mortality_utm_zone'>;

interface ITelemetryAlert extends TelemetryAlertAnimal, TelemetryAlertCollar  {
  alert_id: number;
  alert_type: eAlertType;
  valid_from: Date;
  valid_to: Date;
}

interface ITelemetryAlertInput {
  alert_id: number[];
  alert_action: 'dismiss';
}

export class TelemetryAlert implements ITelemetryAlert, BCTW {
  alert_id: number;
  alert_type: eAlertType;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  collar_id: string;
  device_id: number;
  device_make: string;
  device_status: string;
  device_deployment_status: string;
  @Transform(v => v || new Date(), transformOpt) retrieval_date: Date;
  @Transform((v) => v || false, transformOpt) retrieved: boolean;
  vendor_activation_status: boolean;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  animal_status: string;
  @Transform(v => v || new Date(), transformOpt) mortality_date: Date;
  mortality_latitude: number; 
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  @Expose() get identifier(): string {
    return 'alert_id';
  }
  @Expose() get formatAlert(): string {
    switch(this.alert_type) {
      case eAlertType.mortality:
        return 'Potential Mortality';
      case eAlertType.battery:
        return 'Low Battery'
      default:
        return 'unknown';
    }
  }

  static formatPropAsHeader(str: string): string {
    switch(str) {
      case 'valid_from':
        return 'Recorded At';
      default: 
        return columnToHeader(str);
    }
  }
}

export type {
  eAlertType,
  ITelemetryAlert,
  ITelemetryAlertInput,
}
