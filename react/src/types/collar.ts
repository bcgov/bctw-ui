import { Exclude, Transform } from 'class-transformer';
import { mustbePositiveNumber } from 'components/form/form_validators';
import { Dayjs } from 'dayjs';
import { Animal } from 'types/animal';
import { Code } from 'types/code';
import { BCTWBase, DayjsToPlain, nullToDayjs, toClassOnly, toPlainOnly, uuid } from 'types/common_types';
import { eInputType, FormFieldObject, isRequired } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { classToArray, columnToHeader } from 'utils/common_helpers';
import { DataLife } from './data_life';

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
//Used in table_helpers
export enum eDeviceStatus {
  mortality = 'Mortality',
  active = 'Active',
  malfunction = 'Malfunction',
  offline = 'Offline',
  potential_mortality = 'Potential Mortality',
  unknown = 'Unknown',
  potential_malfunction = 'Potential Malfunction'
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
export interface ICollar extends ICollarTelemetryBase {
  activation_comment: string;
  activation_status: boolean;
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
  fix_interval_rate: Code;
  frequency_unit: Code;
  malfunction_comment: string;
  malfunction_date: Dayjs;
  device_malfunction_type: Code;
  offline_date: Dayjs;
  offline_type: string;
  offline_comment: string;
  permission_type?: eCritterPermission; // fetched collars should contain this
  retrieval_date: Dayjs;
  retrieved: boolean;
  retrieval_comment: string;
  satellite_network: Code;
}

export class Collar implements BCTWBase<Collar>, ICollar {
  activation_comment: string;
  activation_status: boolean;
  readonly collar_id: uuid;
  camera_device_id: number;
  @Exclude(toPlainOnly) collar_transaction_id: uuid;
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
  fix_interval_rate: Code;
  frequency: number;
  frequency_unit: Code;
  malfunction_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) malfunction_date: Dayjs;
  device_malfunction_type: Code;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) offline_date: Dayjs;
  offline_type: string;
  offline_comment: string;
  @Exclude(toPlainOnly) permission_type: eCritterPermission;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) retrieval_date: Dayjs;
  retrieved: boolean;
  retrieval_comment: string;
  satellite_network: Code;
  device_comment: string;
  @Exclude(toPlainOnly) @Transform(nullToDayjs) valid_from: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs) valid_to: Dayjs;
  @Exclude(toPlainOnly) owned_by_user_id: number;

  get frequencyPadded(): string {
    const freq = this.frequency.toString();
    const numDecimalPlaces = freq.slice(freq.lastIndexOf('.') + 1).length;
    const numToAdd = 3 - numDecimalPlaces + freq.length;
    return freq.padEnd(numToAdd, '0');
  }
  get identifier(): string {
    return 'collar_id';
  }

  constructor(collar_id = '') {
    this.collar_id = collar_id;
  }

  formatPropAsHeader(str: keyof Collar): string {
    switch (str) {
      case 'activation_status':
        return 'Subscription';
      case 'camera_device_id':
        return 'Camera ID';
      case 'device_deployment_status':
      case 'device_malfunction_type':
        return columnToHeader(str.replace('device_', ''));
      case 'dropoff_device_id':
        return 'Drop-off ID';
      case 'dropoff_frequency':
        return 'Drop-off Frequency';
      case 'dropoff_frequency_unit':
        return 'Frequency Unit';
      case 'frequency':
        return 'Beacon Frequency';
      default:
        return columnToHeader(str);
    }
  }

  tagColor(): 'error' | 'success' | 'warning' {
    const { mortality, active, malfunction, potential_mortality, potential_malfunction } = eDeviceStatus;
    switch (this.device_status) {
      case mortality:
      case potential_mortality:
        return 'error';
      case active:
        return 'success';
      case malfunction:
      case potential_malfunction:
        return 'warning';
    }
  }

  static get propsToDisplay(): (keyof Collar)[] {
    return [
      'device_id',
      'device_status',
      'frequency',
      'device_type',
      'device_make',
      'activation_status',
      'device_model'
    ];
  }

  get displayProps(): (keyof Collar)[] {
    return Collar.propsToDisplay;
  }

  historyDisplayProps(): (keyof Collar)[] {
    const keys = Object.keys(new Collar()) as unknown as (keyof Collar)[];
    const startsWith = this.displayProps;
    const excludes = ['collar_id', 'collar_transaction_id'] as (keyof Collar)[];
    return classToArray(keys, startsWith, excludes);
  }
  static get toCSVHeaderTemplate(): string[] {
    const excluded: (keyof Collar)[] = ['collar_transaction_id'];
    const keys = Object.keys(new Collar()).filter((k) => !(excluded as string[]).includes(k));
    return keys;
  }
}

export interface IAttachedCollar extends ICollar, Pick<Animal, 'wlh_id' | 'animal_id' | 'critter_id'> {
  last_transmission_date?: Dayjs; // present on attached devices
}

export class AttachedCollar extends Collar implements IAttachedCollar, BCTWBase<AttachedCollar>, DataLife {
  @Exclude(toPlainOnly) assignment_id: uuid;
  @Exclude(toPlainOnly) attachment_start: Dayjs;
  @Exclude(toPlainOnly) data_life_start: Dayjs;
  @Exclude(toPlainOnly) data_life_end: Dayjs;
  @Exclude(toPlainOnly) attachment_end: Dayjs;
  readonly wlh_id: string;
  readonly animal_id: string;
  readonly critter_id: string;
  @Transform(nullToDayjs) last_transmission_date?: Dayjs;
  @Transform(nullToDayjs) last_update_attempt?: Dayjs;

  // for attached collars, also display...
  static get attachedDevicePropsToDisplay(): (keyof AttachedCollar)[] {
    return [...super.propsToDisplay, 'wlh_id', 'animal_id'];
  }

  static get dataRetrievalPropsToDisplay(): (keyof AttachedCollar)[] {
    return [
      'device_id',
      'last_transmission_date',
      'last_update_attempt',
      'device_status',
      'activation_status',
      'device_make',
      'device_model'
    ];
  }
}

const positive = { validate: mustbePositiveNumber };

export const collarFormFields: Record<string, FormFieldObject<Collar>[]> = {
  frequencyFields: [
    { prop: 'frequency', type: eInputType.number, ...isRequired, ...positive },
    { prop: 'frequency_unit', type: eInputType.code, ...isRequired },
    { prop: 'fix_interval', type: eInputType.number, ...isRequired, ...positive },
    { prop: 'fix_interval_rate', type: eInputType.code, ...isRequired, codeName: 'fix_unit' }
  ],
  deviceOptionFields: [
    { prop: 'dropoff_frequency', type: eInputType.number, ...positive },
    { prop: 'dropoff_frequency_unit', type: eInputType.code, codeName: 'frequency_unit' }
  ],
  identifierFields: [
    { prop: 'device_id', type: eInputType.number, ...isRequired, ...positive },
    { prop: 'device_make', type: eInputType.code, ...isRequired },
    { prop: 'device_model', type: eInputType.text, ...isRequired }
  ],
  isActiveField: [
    { prop: 'activation_status', type: eInputType.check },
    { prop: 'activation_comment', type: eInputType.multiline }
  ],
  activationFields: [
    { prop: 'first_activation_year', type: eInputType.number },
    { prop: 'first_activation_month', type: eInputType.number }
  ],
  statusFields: [
    { prop: 'device_status', type: eInputType.code, ...isRequired },
    { prop: 'device_deployment_status', type: eInputType.code, ...isRequired },
    { prop: 'device_condition', type: eInputType.code, ...isRequired }
  ],
  retrievalFields: [
    { prop: 'retrieved', type: eInputType.check },
    { prop: 'retrieval_date', type: eInputType.datetime },
    { prop: 'retrieval_comment', type: eInputType.multiline }
  ],
  malfunctionOfflineFields: [
    { prop: 'malfunction_date', type: eInputType.datetime },
    { prop: 'device_malfunction_type', type: eInputType.code },
    { prop: 'offline_date', type: eInputType.datetime },
    { prop: 'offline_type', type: eInputType.code },
    { prop: 'offline_comment', type: eInputType.multiline },
    { prop: 'malfunction_comment', type: eInputType.multiline }
  ],
  // fields that are rendered individually due to form state
  otherFields: [
    { prop: 'device_comment', type: eInputType.multiline },
    { prop: 'device_type', type: eInputType.code, ...isRequired },
    { prop: 'satellite_network', type: eInputType.code },
    { prop: 'camera_device_id', type: eInputType.number, ...positive },
    { prop: 'dropoff_device_id', type: eInputType.number, ...positive }
  ]
};

// flattened version of all available collarfields
export const getDeviceFormFields = (): FormFieldObject<Collar>[] => {
  return Object.values(collarFormFields).reduce((previous, current) => [...previous, ...current], []);
};

// vectronic keys upload result
export interface IVectronicUpsert {
  collarkey: string;
  collartype: string;
  comptype: string;
  idcollar: number;
  idcom: string;
}
