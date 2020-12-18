import { columnToHeader } from 'utils/common';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';
export interface ICollarBase {
  device_id: number;
}

const formatCollarProp = (prop: string): string => {
  switch (prop) {
    case 'device_id':
      return 'Device ID';
    case 'make':
      return 'Collar Make';
    case 'model':
      return 'Collar Model';
    case 'animal_id':
      return 'Individual ID';
    case 'max_transmission_date':
      return 'Last Update';
    default:
      return columnToHeader(prop);
  }
}

export interface ICollar extends ICollarBase, BCTW {
  make: string;
  model: string;
  deployment_status: string;
  collar_status: string;
  collar_type: string;
  deactivated: boolean;
  radio_frequency: number;
  malfunction_date: Date;
  max_transmission_date: Date;
  reg_key: string;
  retreival_date: Date;
  satellite_network: string;
}

export class Collar implements ICollar {
  device_id: number;
  make: string;
  model: string;
  deployment_status: string;
  collar_status: string;
  collar_type: string;
  deactivated: boolean;
  radio_frequency: number;
  @Type(() => Date) malfunction_date: Date;
  @Type(() => Date) max_transmission_date: Date;
  reg_key: string;
  @Type(() => Date) retreival_date: Date;
  satellite_network: string;

  formatPropAsHeader(str: string): string {
    return formatCollarProp(str);
  } 
}

// used when creating new collars manually
export enum NewCollarType {
  VHF,
  Vect,
  Other,
}

// properties displayed on collar pages
const assignedCollarProps = [ 'animal_id', 'device_id', 'collar_status', 'max_transmission_date', 'make', 'model', 'collar_type'];
const availableCollarProps = [ 'device_id', 'collar_status', 'max_transmission_date', 'make', 'model', 'collar_type'];

export {
  assignedCollarProps,
  availableCollarProps,
  formatCollarProp,
}