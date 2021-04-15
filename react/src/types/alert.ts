import { Type } from 'class-transformer';
import { Animal } from './animal';

enum eAlertType {
  battery = 'battery',
  mortality = 'mortality'
}

interface ITelemetryAlert {
  alert_id: number;
  alert_type: eAlertType;
  collar_id: string;
  device_id: number;
  device_make: string;
  device_status: string;
  // device_deployment_status: string;
  malfunction_date: Date;
  device_malfunction_type: string;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  animal_status: string;
  valid_from: Date;
  valid_to: Date;
}

export class TelemetryAlert implements ITelemetryAlert {
  alert_id: number;
  alert_type: eAlertType;
  collar_id: string;
  device_id: number;
  device_make: string;
  device_status: string;
  // device_deployment_status: string;
  @Type(() => Date) malfunction_date: Date;
  device_malfunction_type: string;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  animal_status: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;

  static formatPropAsHeader(str: string): string {
    switch(str) {
      case 'device_id':
        return 'Device ID';
      case 'valid_from':
        return 'Recorded At';
      default: 
        return new Animal().formatPropAsHeader(str);
    }
  }

  formatAlertType(): string {
    switch (this.alert_type) {
      case eAlertType.mortality:
        return 'Potential Mortality!';
      case eAlertType.battery:
        return 'Low Battery!'
    }
  }
}

export type {
  eAlertType,
  ITelemetryAlert
}
