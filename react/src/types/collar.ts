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
  frequency: number;
  device_status;
  device_id: number;
}

export interface ICollar extends ICollarTelemetryBase, BCTW, BCTWBaseType {
  collar_transaction_id: string;
  camera_device_id: number;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_type: string;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: string;
  fix_rate: number;
  fix_success_rate: number;
  frequency_unit: string;
  malfunction_date: Date;
  purchase_comment: string;
  purchase_month: number;
  purchase_year: number;
  retrieval_date: Date;
  retrieved: boolean;
  satellite_network: string;
  user_comment: string;
  vendor_activation_status: boolean;
  // collars attached to a critter should includes this prop
  animal_id?: string;
  // fetched collars should contain this
  permission_type?: eCritterPermission;
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
  collar_id: string;
  @Transform(v => v || 0, transformOpt) camera_device_id: number;
  collar_transaction_id: string;
  device_id: number;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_status: string;
  device_type: string;
  @Transform(v => v || -1, transformOpt) dropoff_device_id: number;
  @Transform(v => v || -1, transformOpt) dropoff_frequency: number;
  dropoff_frequency_unit: string;
  fix_rate: number;
  fix_success_rate: number;
  @Transform(v => v || -1, transformOpt) frequency: number;
  frequency_unit: string;
  @Type(() => Date) malfunction_date: Date;
  purchase_comment: string;
  @Transform(v => v || -1, transformOpt) purchase_month: number;
  @Transform(v => v || -1, transformOpt) purchase_year: number;
  @Transform(v => v || getInvalidDate(), transformOpt) retrieval_date: Date;
  @Transform(v => v || false, transformOpt) retrieved: boolean;
  satellite_network: string;
  @Transform(v => v || false, transformOpt) vendor_activation_status: boolean;
  animal_id?: string;
  user_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  permission_type: eCritterPermission;
  @Expose() get identifier(): string { return 'collar_id' }
  @Expose() get frequencyPadded(): string {
    const freq = this.frequency.toString();
    const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
    const numToAdd = 3 - numDecimalPlaces + freq.length;
    return freq.padEnd(numToAdd, '0');
  }

  constructor(collar_type?: eNewCollarType) {
    this.retrieval_date = getInvalidDate()
    this.malfunction_date = getInvalidDate();
    this.vendor_activation_status = false;
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
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
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
      case 'vendor_activation_status':
        return 'Is device active with vendor?'
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
    { prop: 'fix_rate', type: eInputType.number },
    { prop: 'vendor_activation_status', type: eInputType.check },
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
  purchaseFields: [
    { prop: 'purchase_year', type: eInputType.number },
    { prop: 'purchase_month', type: eInputType.number },
    { prop: 'purchase_comment', type: eInputType.number }
  ],
  statusFields: [
    { prop: 'device_status', type: eInputType.code },
    { prop: 'malfunction_date', type: eInputType.date },
    { prop: 'device_malfunction_type', type: eInputType.code },
    { prop: 'device_deployment_status', type: eInputType.code },
    { prop: 'retrieval_date', type: eInputType.date },
    { prop: 'retrieved', type: eInputType.check }
  ],
  userCommentField: [
    { prop: 'user_comment', type: eInputType.text }
  ]
}

export {
  collarFormFields,
  attachedCollarProps,
  collarPropsToDisplay,
};