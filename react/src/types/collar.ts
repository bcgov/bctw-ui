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
  // satellite_network: string;
  device_status;
  device_id: number;
}

export interface ICollar extends ICollarTelemetryBase, BCTW, BctwBaseType {
  collar_transaction_id: string;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_status: string;
  device_type: string;
  fix_rate: number;
  fix_success_rate: number;
  frequency: number;
  frequency_unit_code: string;
  malfunction_date: Date;
  retrieval_date: Date;
  retrieved: boolean;
  satellite_network: string;
  vendor_activation_status: boolean;
  sensor_mortality?: boolean;
  sensor_battery?: boolean;
  // max_transmission_date: Date;
  animal_id?: string; // get collars includes this if collar attached
}

const editableCollarProperties = [
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
  'frequency_unit_code',
  'malfunction_date',
  'retrieval_date',
  'retrieved',
  'satellite_network',
  'vendor_activation_status',
]
export class Collar implements ICollar {
  collar_id: string;
  collar_transaction_id: string;
  device_id: number;
  device_deployment_status: string;
  device_make: string;
  device_malfunction_type: string;
  device_model: string;
  device_status: string;
  device_type: string;
  fix_rate: number;
  fix_success_rate: number;
  frequency: number;
  frequency_unit_code: string;
  @Type(() => Date) malfunction_date: Date;
  @Type(() => Date) retrieval_date: Date;
  retrieved: boolean;
  satellite_network: string;
  vendor_activation_status: boolean;
  sensor_mortality?: boolean;
  sensor_battery?: boolean;
  // @Type(() => Date) max_transmission_date: Date;
  animal_id?: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'collar_id' }

  constructor(collar_type?: eNewCollarType) {
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

// properties displayed on collar pages
const collarPropsToDisplay = [
  'device_id',
  'device_status',
  // 'max_transmission_date', 
  'frequency',
  'device_type',
  'device_make',
  'device_model',
];

const attachedCollarProps = ['(WLH_ID/Animal ID)', ...collarPropsToDisplay];

const isCollar = (c: unknown): c is Collar => {
  const collar = c as Collar;
  return !!(collar.collar_id && collar.device_id);
};

export {
  attachedCollarProps,
  collarPropsToDisplay,
  isCollar,
  editableCollarProperties,
};