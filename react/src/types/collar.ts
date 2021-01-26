import { columnToHeader } from 'utils/common';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';
export interface ICollarBase {
  collar_id: string;
}

const formatCollarProp = (prop: string): string => {
  switch (prop) {
    case 'device_id':
      return 'Device ID';
    case 'animal_id':
      return 'Individual ID';
    case 'max_transmission_date':
      return 'Last Update';
    default:
      return columnToHeader(prop);
  }
}

export interface ICollar extends ICollarBase, BCTW {
  device_id: number;
  collar_make: string;
  collar_model: string;
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
  collar_id: string;
  device_id: number;
  collar_make: string;
  collar_model: string;
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

  constructor() {
    this.radio_frequency = 0;
    this.device_id = 0;
    // this.collar_type = collar_type;
    // this.make = collar_make;
  }
  formatPropAsHeader(str: string): string {
    return formatCollarProp(str);
  } 
}

// used when creating new collars manually
export enum NewCollarType {
  Other = '',
  VHF = 'VHF',
  Vect = 'Vectronics',
}

// properties displayed on collar pages
const assignedCollarProps = [ 'animal_id', 'device_id', 'collar_status', 'max_transmission_date', 'collar_make', 'collar_model', 'collar_type'];
const availableCollarProps = [ 'device_id', 'collar_status', 'max_transmission_date', 'collar_make', 'collar_model', 'collar_type'];

/**
 * instantiating some properties by default on a new collar
 * fixme: hardcoded?
 */
const newCollarTypeToSelectableCode = (type: NewCollarType): Record<string, string> => {
  const makeKey = 'collar_make';
  const typeKey = 'collar_type';
  const gpsType = {[typeKey]: 'VHF + GPS'}
  const vhfType = {[typeKey]: 'VHF'}
  switch (type) {
    case NewCollarType.VHF:
      return {[makeKey]: 'Advanced Telemetry Systems', ...vhfType}
    case NewCollarType.Vect:
    default:
      return {[typeKey]: '', ...gpsType}
  }

}

export {
  assignedCollarProps,
  availableCollarProps,
  formatCollarProp,
  newCollarTypeToSelectableCode,
}