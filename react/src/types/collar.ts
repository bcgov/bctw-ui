import { columnToHeader } from 'utils/common';
import { BCTW, BctwBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';

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

export interface ICollar extends ICollarTelemetryBase, BCTW, BctwBaseType {
  collar_transaction_id: string;
  camera_device_id: string;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_status: string;
  device_type: string;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: number;
  fix_rate: number;
  fix_success_rate: number;
  frequency: number;
  frequency_unit: string;
  malfunction_date: Date;
  purchase_comment: string;
  purchase_month: number;
  purchase_date: number;
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

// export/import properties
const exportableCollarProperties = [
  'device_id',
  'device_deployment_status',
  'device_make',
  'device_malfunction_type',
  'device_model',
  'device_status',
  'device_type',
  'fix_rate',
  'fix_success_rate',
  'frequency',
  'frequency_unit',
  'malfunction_date',
  'retrieval_date',
  'retrieved',
  'satellite_network',
  'vendor_activation_status',
]

// for attached collars, also display...
const attachedCollarProps = ['(WLH_ID/Animal ID)', ...collarPropsToDisplay];
export class Collar implements ICollar {
  collar_id: string;
  camera_device_id: string;
  collar_transaction_id: string;
  device_id: number;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_status: string;
  device_type: string;
  dropoff_device_id: number;
  dropoff_frequency: number;
  dropoff_frequency_unit: number;
  fix_rate: number;
  fix_success_rate: number;
  frequency: number;
  frequency_unit: string;
  @Type(() => Date) malfunction_date: Date;
  purchase_comment: string;
  purchase_month: number;
  purchase_date: number;
  purchase_year: number;
  @Type(() => Date) retrieval_date: Date;
  retrieved: boolean;
  satellite_network: string;
  vendor_activation_status: boolean;
  animal_id?: string;
  user_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'collar_id' }

  constructor(collar_type?: eNewCollarType) {
    this.retrieval_date = new Date();
    this.malfunction_date = new Date();
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
      case 'device_id':
        return 'Device ID';
      case 'animal_id':
        return 'Individual ID';
      case 'max_transmission_date':
        return 'Last Update';
      case 'device_type':
      case 'device_make':
      case 'device_model':
        return columnToHeader(str.replace('device_', ''));
      case 'device_deployment_status':
        return 'Deployed';
      default:
        return columnToHeader(str);
    }
  }
}

export {
  attachedCollarProps,
  collarPropsToDisplay,
  exportableCollarProperties,
};