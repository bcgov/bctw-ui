import { Expose, Transform } from 'class-transformer';
import { Dayjs } from 'dayjs';
import { Animal } from 'types/animal';
import { Code } from 'types/code';
import { BCTWBaseType, nullToDayjs, PartialPick, uuid } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { columnToHeader } from 'utils/common_helpers';

// fetchable api collar types
export enum eCollarAssignedStatus {
  Assigned = 'Assigned', // currently attached to a critter
  Available = 'Available'
}

// used when creating new collars manually
export enum eNewCollarType {
  Other = '',
  VHF = 'VHF',
  Vect = 'Vectronics'
}
export interface ICollarBase {
  readonly collar_id: uuid;
}
export interface ICollarTelemetryBase extends ICollarBase {
  device_id: number;
  device_status: Code;
  frequency: number;
}

// export interface ICollar extends ICollarTelemetryBase, BCTW, BCTWBaseType {
export interface ICollar extends ICollarTelemetryBase, PartialPick<Animal, 'wlh_id' | 'animal_id'> {
  activation_comment: string; // fixme: missing?
  activation_status: boolean;
  animal_id?: string; // collars attached to a critter should includes this prop
  camera_device_id: number;
  readonly collar_transaction_id: uuid;
  device_comment: string;
  device_deployment_status: Code;
  device_make: Code;
  device_model: string;
  device_type: Code;
  device_condition: Code;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: Code;
  first_activation_month: number;
  first_activation_year: number;
  fix_interval: number;
  fix_interval_unit: Code; // fixme: is now fix_interval_rate?
  fix_success_rate: number; // fixme: removed?
  frequency_unit: Code;
  malfunction_date: Dayjs;
  device_malfunction_type: Code;
  offline_date: Dayjs;
  offline_type: string;
  permission_type?: eCritterPermission; // fetched collars should contain this
  retrieval_date: Dayjs;
  retrieved: boolean;
  satellite_network: Code;
}

export class Collar implements BCTWBaseType<Collar>, ICollar  {
  activation_comment: string;
  activation_status: boolean;
  readonly collar_id: uuid;
  camera_device_id: number;
  readonly collar_transaction_id: uuid;
  device_id: number;
  device_deployment_status: Code;
  device_make: Code;
  device_model: string;
  device_status: Code;
  device_condition: Code;
  device_type: Code;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: Code;
  first_activation_month: number;
  first_activation_year: number;
  fix_interval: number;
  fix_interval_unit: Code;
  fix_success_rate: number;
  frequency: number;
  frequency_unit: Code;
  @Transform(nullToDayjs) malfunction_date: Dayjs;
  device_malfunction_type: Code;
  @Transform(nullToDayjs) offline_date: Dayjs;
  offline_type: string;
  permission_type: eCritterPermission;
  @Transform(nullToDayjs) retrieval_date: Dayjs;
  retrieved: boolean;
  satellite_network: Code;
  device_comment: string;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;

  animal_id?: string;
  wlh_id?: string;

  @Expose() get frequencyPadded(): string {
    const freq = this.frequency.toString();
    const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
    const numToAdd = 3 - numDecimalPlaces + freq.length;
    return freq.padEnd(numToAdd, '0');
  }
  @Expose() get identifier(): string { return 'collar_id' }

  // fixme: 
  constructor(collar_type?: eNewCollarType) {
    this.activation_status = false;
    this.device_id = 0;
    if (collar_type) {
      switch (collar_type) {
        case eNewCollarType.VHF:
          this.device_make = 'ATS';
          this.device_type = 'VHF';
          return;
        case eNewCollarType.Vect:
          this.device_type = 'VHF + GPS';
          return;
      }
    }
    this.frequency = 0;
    this.device_id = 0;
  }

  // todo: dayjs to formatted string
  toJSON(): Collar {
    if (!this.retrieval_date.isValid()) {
      delete this.retrieval_date;
    }
    if (!this.malfunction_date.isValid()) {
      delete this.malfunction_date
    }
    if (!this.offline_date.isValid()) {
      delete this.offline_date
    }
    return this;
  }

  formatPropAsHeader(str: keyof Collar): string {
    switch (str) {
      case 'activation_status':
        return 'Is device active with vendor?'
      case 'camera_device_id':
        return 'Camera Module ID';
      case 'device_deployment_status':
      case 'device_malfunction_type':
        return columnToHeader(str.replace('device_', ''))
      case 'dropoff_device_id':
        return 'Drop-off Module ID'
      case 'dropoff_frequency':
        return 'Drop-off Module Frequency'
      case 'dropoff_frequency_unit':
        return 'Drop-off Module Frequency Unit'
      case 'frequency':
        return 'Beacon Frequency'
      // case 'implant_device_id':
        // return 'Implant Module ID'
      default:
        return columnToHeader(str);
    }
  }

  static get propsToDisplay(): (keyof Collar)[] {
    return [ 'device_id', 'device_status', 'frequency', 'device_type', 'device_make', 'device_model' ];
  }
  // for attached collars, also display...
  static get attachedPropsToDisplay(): (keyof Collar)[] {
    return [...Collar.propsToDisplay, 'wlh_id', 'animal_id', ];
  }

  get displayProps(): (keyof Collar)[] {
    return this.animal_id ? Collar.attachedPropsToDisplay : Collar.propsToDisplay;
  }
}

const collarFormFields: Record<string, FormFieldObject<Collar>[]> = {
  communicationFields: [
    { prop: 'device_type', type: eInputType.code },
    { prop: 'satellite_network', type: eInputType.code },
    { prop: 'frequency', type: eInputType.number },
    { prop: 'frequency_unit', type: eInputType.code },
    { prop: 'fix_interval', type: eInputType.number },
    { prop: 'fix_interval_unit', type: eInputType.code }, //fixme: what code header name is this?
  ],
  deviceOptionFields: [
    { prop: 'camera_device_id', type: eInputType.number },
    { prop: 'dropoff_device_id', type: eInputType.number },
    { prop: 'dropoff_frequency', type: eInputType.number },
    { prop: 'dropoff_frequency_unit', type: eInputType.code, codeName: 'frequency_unit' },
  ],
  identifierFields: [
    { prop: 'device_id', type: eInputType.number },
    { prop: 'device_make', type: eInputType.code },
    { prop: 'device_model', type: eInputType.text }
  ],
  activationFields: [
    { prop: 'activation_status', type: eInputType.check },
    { prop: 'first_activation_year', type: eInputType.number },
    { prop: 'first_activation_month', type: eInputType.number },
    { prop: 'activation_comment', type: eInputType.number }
  ],
  statusFields: [
    { prop: 'device_status', type: eInputType.code },
  ],
  retrievalFields: [
    { prop: 'retrieval_date', type: eInputType.datetime },
    { prop: 'retrieved', type: eInputType.check }
  ],
  malfunctionOfflineFields: [
    { prop: 'device_deployment_status', type: eInputType.code },
    { prop: 'malfunction_date', type: eInputType.datetime },
    { prop: 'device_malfunction_type', type: eInputType.code },
    { prop: 'offline_date', type: eInputType.datetime },
    { prop: 'offline_type', type: eInputType.code },
  ],
  deviceCommentField: [
    { prop: 'device_comment', type: eInputType.text }
  ]
}

export { collarFormFields };