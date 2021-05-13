import { columnToHeader } from 'utils/common';
import { BCTW, BCTWBaseType, FormFieldObject } from 'types/common_types';
import { Type, Expose, Transform } from 'class-transformer';
import { transformOpt } from 'types/animal';

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
  // api call to retrieve attached collars includes this
  animal_id?: string;
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
const attachedCollarProps = ['(WLH_ID/Animal ID)', ...collarPropsToDisplay];
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
  @Transform(v => v || 0, transformOpt) dropoff_device_id: number;
  @Transform(v => v || 0, transformOpt) dropoff_frequency: number;
  dropoff_frequency_unit: string;
  fix_rate: number;
  fix_success_rate: number;
  @Transform(v => v || 0, transformOpt) frequency: number;
  frequency_unit: string;
  @Type(() => Date) malfunction_date: Date;
  purchase_comment: string;
  @Transform(v => v || 0, transformOpt) purchase_month: number;
  @Transform(v => v || 0, transformOpt) purchase_year: number;
  @Transform(v => v || new Date(), transformOpt) retrieval_date: Date; // @Type(() => Date)
  @Transform(v => v || false, transformOpt) retrieved: boolean;
  satellite_network: string;
  @Transform(v => v || false, transformOpt) vendor_activation_status: boolean;
  animal_id?: string;
  user_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'collar_id' }

  // fixme: 
  constructor(collar_type?: eNewCollarType) {
    this.retrieval_date = new Date();
    this.malfunction_date = new Date();
    this.vendor_activation_status = false;
    this.device_id = 0;
    if (collar_type) {
      switch(collar_type) {
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

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'device_deployment_status':
        return columnToHeader(str.replace('device_', ''))
      case 'frequency':
        return 'Beacon Frequency'
      case 'camera_device_id':
        return 'Camera Module ID';
      case 'dropoff_device_id':
        return 'Drop-off Module ID'
      case 'dropoff_frequency':
        return 'Drop-off Module Frequency'
      case 'dropoff_frequency_unit':
        return 'Drop-off Module Frequency Unit'
        case 'implant_device_id':
          return 'Implant Module ID'
        case 'vendor_activation_status':
        return 'Is device active with vendor?'
      default:
        return columnToHeader(str);
    }
  }
}

const collarFormFields: Record<string, FormFieldObject[]> = {
  communicationFields: [
    { prop: 'device_type', isCode: true },
    { prop: 'satellite_network', isCode: true },
    { prop: 'frequency' },
    { prop: 'frequency_unit', isCode: true },
    { prop: 'vendor_activation_status', isBool: true },
    { prop: 'fix_rate' }
  ],
  deviceOptionFields: [
    { prop: 'camera_device_id' },
    { prop: 'dropoff_device_id' },
    { prop: 'dropoff_frequency' },
    { prop: 'dropoff_frequency_unit' },
    { prop: 'implant_device_id' }
  ],
  identifierFields: [
    { prop: 'device_id' },
    { prop: 'device_make', isCode: true },
    { prop: 'device_model' }
  ],
  purchaseFields: [
    { prop: 'purchase_year' },
    { prop: 'purchase_month' },
    { prop: 'purchase_comment' }
  ],
  statusFields: [
    { prop: 'device_status', isCode: true },
    { prop: 'malfunction_date' },
    { prop: 'malfunction_type' },
    { prop: 'device_deployment_status', isCode: true },
    { prop: 'retrieved', isBool: true },
    { prop: 'retrieval_date', isDate: true }
  ],
  userCommentField: [
    { prop: 'user_comment' }
  ]
}

export {
  collarFormFields,
  attachedCollarProps,
  collarPropsToDisplay,
};