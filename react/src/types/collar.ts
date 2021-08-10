import { columnToHeader } from 'utils/common_helpers';
import { BCTW, BCTWBaseType } from 'types/common_types';
import { Type, Expose, Transform } from 'class-transformer';
import { transformOpt } from 'types/animal';
import { eInputType, FormFieldObject } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { getInvalidDate, isInvalidDate } from 'utils/time';

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
  collar_id: string;
}
export interface ICollarTelemetryBase extends ICollarBase {
  device_id: number;
  device_status;
  frequency: number;
}

export interface ICollar extends ICollarTelemetryBase, BCTW, BCTWBaseType {
  activation_comment: string;
  activation_status: boolean;
  animal_id?: string; // collars attached to a critter should includes this prop
  camera_device_id: number;
  collar_transaction_id: string;
  device_comment: string;
  device_deployment_status: string;
  device_make: string;
  device_model: string;
  device_type: string;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: string;
  first_activation_month: number;
  first_activation_year: number;
  fix_interval: number;
  fix_interval_unit: string;
  // fix_rate: number;
  fix_success_rate: number;
  frequency_unit: string;
  malfunction_date: Date;
  malfunction_type: string;
  offline_date: Date;
  offline_type: string;
  permission_type?: eCritterPermission; // fetched collars should contain this
  retrieval_date: Date;
  retrieved: boolean;
  satellite_network: string;
}

// properties displayed on collar pages
const collarPropsToDisplay = [
  'device_id',
  'device_status',
  'frequency',
  'device_type',
  'device_make',
  'device_model',
];

// for attached collars, also display...
// const attachedCollarProps = ['(WLH_ID/Animal ID)', '(WLH_ID)', '(Animal_ID)', ...collarPropsToDisplay];
const attachedCollarProps = ['WLH_ID', 'Animal_ID', ...collarPropsToDisplay];
export class Collar implements ICollar {
  activation_comment: string;
  @Transform(v => v || false, transformOpt) activation_status: boolean;
  animal_id?: string;
  collar_id: string;
  @Transform(v => v || 0, transformOpt) camera_device_id: number;
  collar_transaction_id: string;
  device_id: number;
  device_deployment_status: string;
  device_make: string;
  device_model: string;
  device_status: string;
  device_type: string;
  @Transform(v => v || -1, transformOpt) dropoff_device_id: number;
  @Transform(v => v || -1, transformOpt) dropoff_frequency: number;
  dropoff_frequency_unit: string;
  @Transform(v => v || -1, transformOpt) first_activation_month: number;
  @Transform(v => v || -1, transformOpt) first_activation_year: number;
  fix_interval: number;
  fix_interval_unit: string;
  // fix_rate: number;
  fix_success_rate: number;
  @Transform(v => v || -1, transformOpt) frequency: number;
  frequency_unit: string;
  @Type(() => Date) malfunction_date: Date;
  malfunction_type: string;
  @Type(() => Date) offline_date: Date;
  offline_type: string;
  permission_type: eCritterPermission;
  @Transform(v => v || getInvalidDate(), transformOpt) retrieval_date: Date;
  @Transform(v => v || false, transformOpt) retrieved: boolean;
  satellite_network: string;
  device_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get frequencyPadded(): string {
    const freq = this.frequency.toString();
    const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
    const numToAdd = 3 - numDecimalPlaces + freq.length;
    return freq.padEnd(numToAdd, '0');
  }
  @Expose() get identifier(): string { return 'collar_id' }

  constructor(collar_type?: eNewCollarType) {
    this.retrieval_date = getInvalidDate()
    this.malfunction_date = getInvalidDate();
    this.offline_date = getInvalidDate();
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

  toJSON(): Collar {
    if (isInvalidDate(this.retrieval_date)) {
      delete this.retrieval_date;
    }
    if (isInvalidDate(this.malfunction_date)) {
      delete this.malfunction_date
    }
    if (isInvalidDate(this.offline_date)) {
      delete this.offline_date
    }
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'activation_status':
        return 'Is device active with vendor?'
      case 'camera_device_id':
        return 'Camera Module ID';
      case 'device_deployment_status':
        return columnToHeader(str.replace('device_', ''))
      case 'dropoff_device_id':
        return 'Drop-off Module ID'
      case 'dropoff_frequency':
        return 'Drop-off Module Frequency'
      case 'dropoff_frequency_unit':
        return 'Drop-off Module Frequency Unit'
      case 'frequency':
        return 'Beacon Frequency'
      case 'implant_device_id':
        return 'Implant Module ID'
      default:
        return columnToHeader(str);
    }
  }
}

const collarFormFields: Record<string, FormFieldObject<Collar>[]> = {
  communicationFields: [
    { prop: 'device_type', type: eInputType.code },
    { prop: 'satellite_network', type: eInputType.code },
    { prop: 'frequency', type: eInputType.number },
    { prop: 'frequency_unit', type: eInputType.code },
    { prop: 'fix_interval', type: eInputType.number },
    { prop: 'fix_interval_unit', type: eInputType.code },
    // { prop: 'fix_rate', type: eInputType.number },
  ],
  deviceOptionFields: [
    { prop: 'camera_device_id', type: eInputType.number },
    { prop: 'dropoff_device_id', type: eInputType.number },
    { prop: 'dropoff_frequency', type: eInputType.number },
    { prop: 'dropoff_frequency_unit', type: eInputType.number },
    // { prop: 'implant_device_id' } // fixme:
  ],
  identifierFields: [
    { prop: 'device_id', type: eInputType.number },
    { prop: 'device_make', type: eInputType.code },
    { prop: 'device_model', type: eInputType.code }
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
    { prop: 'retrieval_date', type: eInputType.date },
    { prop: 'retrieved', type: eInputType.check }
  ],
  malfunctionOfflineFields: [
    { prop: 'device_deployment_status', type: eInputType.code },
    { prop: 'malfunction_date', type: eInputType.date },
    { prop: 'malfunction_type', type: eInputType.code },
    { prop: 'offline_date', type: eInputType.date },
    { prop: 'offline_type', type: eInputType.code },
  ],
  deviceCommentField: [
    { prop: 'device_comment', type: eInputType.text }
  ]
}

export {
  collarFormFields,
  attachedCollarProps,
  collarPropsToDisplay,
};