import { Transform } from 'class-transformer';
import { CritterStrings } from 'constants/strings';
import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { BaseTimestamps, BCTWBase, nullToDayjs, uuid } from 'types/common_types';
import { eInputType, FormFieldObject, isRequired } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { columnToHeader } from 'utils/common_helpers';
import { ICollarHistory } from './collar_history';
import { DataLife } from './data_life';

// used in critter getters to specify collar attachment status
export enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned'
}

/**
 * Animal properties that are re-used in Telemetry classes (map.ts)
 */
export interface IAnimalTelemetryBase {
  animal_id: string;
  animal_status: Code;
  capture_date: Dayjs | Date;
  collective_unit: string; // fixme: what is this
  map_colour: Code;
  species: Code;
  population_unit: Code;
  wlh_id: string;
}

export interface IAnimal extends BaseTimestamps, IAnimalTelemetryBase {
  animal_colouration: string;
  animal_comment: string;
  associated_animal_id: string;
  associated_animal_relationship: Code;

  capture_comment: string;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;

  readonly critter_id: uuid;
  readonly critter_transaction_id: uuid;
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  estimated_age: number;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  life_stage: Code;

  mortality_comment: string;
  mortality_date: Dayjs;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  mortality_report: boolean;
  mortality_investigation: Code;
  captivity_status: boolean;
  mortality_captivity_status: Code;

  permission_type?: eCritterPermission; // critters should contain this
  predator_known: boolean;
  predator_species_pcod: Code;
  predator_species_ucod: Code;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  recapture: boolean;
  region: Code;

  release_comment: string;
  release_date: Dayjs;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;

  sex: Code;
  translocation: boolean;
  ultimate_cause_of_death: Code;
}

export class Animal implements BCTWBase<Animal>, IAnimal {
  readonly critter_id: uuid;
  readonly critter_transaction_id: uuid;
  animal_id: string;
  animal_status: Code;
  associated_animal_id: string;
  associated_animal_relationship: Code;
  capture_comment: string;
  @Transform(nullToDayjs) capture_date: Dayjs;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  collective_unit: string;
  animal_colouration: string;
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  estimated_age: number;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  life_stage: Code;
  map_colour: Code;
  mortality_comment: string;
  @Transform(nullToDayjs) mortality_date: Dayjs;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  predator_known: boolean;
  predator_species_pcod: Code;
  predator_species_ucod: Code;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  ultimate_cause_of_death: Code;
  population_unit: Code;
  recapture: boolean;
  region: Code;
  release_comment: string;
  @Transform(nullToDayjs) release_date: Dayjs;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;
  sex: Code;
  species: Code;
  translocation: boolean;
  wlh_id: string;
  animal_comment: string;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;

  mortality_report: boolean;
  mortality_investigation: Code;
  captivity_status: boolean;
  mortality_captivity_status: Code;

  permission_type: eCritterPermission;

  get identifier(): keyof Animal {
    return 'critter_id';
  }
  get name(): string {
    return this.wlh_id ?? this.animal_id;
  }

  toJSON(): Animal {
    const n = Object.assign(new Animal(), this);
    delete n.permission_type;
    delete n.map_colour;
    delete n.valid_from;
    delete n.valid_to;
    return n;
  }

  formatPropAsHeader(str: keyof Animal): string {
    switch (str) {
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'collective_unit':
        return 'Collective Unit Name';
      case 'critter_id':
        return 'BCTW ID';
      case 'juvenile_at_heel':
        return 'Juvenile at Heel?';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
  get displayProps(): (keyof Animal)[] {
    return ['species', 'population_unit', 'wlh_id', 'animal_id', 'animal_status'];
  }
}

// animals attached to devices should have additional properties
export interface IAttachedAnimal extends IAnimal, ICollarHistory, DataLife {}

export class AttachedAnimal extends Animal implements IAttachedAnimal, BCTWBase<AttachedAnimal> {
  assignment_id: uuid;
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  frequency: number;

  attachment_start: Dayjs;
  data_life_start: Dayjs;
  data_life_end: Dayjs;
  attachment_end: Dayjs;

  // con't overide since this class is inherited
  static get attachedCritterDisplayProps(): (keyof AttachedAnimal)[] {
    return ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency', 'animal_status'];
  }

  formatPropAsHeader(str: keyof Animal): string {
    return super.formatPropAsHeader(str);
  }
}

export const critterFormFields: Record<string, FormFieldObject<Partial<Animal>>[]> = {
  associatedAnimalFields: [
    { prop: 'associated_animal_id', type: eInputType.text },
    { prop: 'associated_animal_relationship', type: eInputType.code }
  ],
  captureFields: [
    { prop: 'capture_date', type: eInputType.datetime },
    { prop: 'capture_latitude', type: eInputType.number },
    { prop: 'capture_longitude', type: eInputType.number },
    { prop: 'capture_utm_zone', type: eInputType.number },
    { prop: 'capture_utm_easting', type: eInputType.number },
    { prop: 'capture_utm_northing', type: eInputType.number },
    { prop: 'recapture', type: eInputType.check },
    { prop: 'capture_comment', type: eInputType.text },
    { prop: 'captivity_status', type: eInputType.check },
  ],
  characteristicsFields: [
    { prop: 'animal_status', type: eInputType.code, ...isRequired },
    { prop: 'species', type: eInputType.code, ...isRequired },
    { prop: 'sex', type: eInputType.code, ...isRequired },
    { prop: 'animal_colouration', type: eInputType.text },
    { prop: 'estimated_age', type: eInputType.number },
    { prop: 'life_stage', type: eInputType.code },
    { prop: 'juvenile_at_heel', type: eInputType.code },
    { prop: 'juvenile_at_heel_count', type: eInputType.number }
  ],
  identifierFields: [
    // todo: tooltip: CritterStrings.wlh_id 
    { prop: 'wlh_id', type: eInputType.text },
    { prop: 'animal_id', type: eInputType.text, ...isRequired },
    { prop: 'region', type: eInputType.code, ...isRequired },
    { prop: 'population_unit', type: eInputType.code, ...isRequired },
    // { prop: 'collective_unit', type: eInputType.text }, // todo:
    { prop: 'ear_tag_left_colour', type: eInputType.text },
    { prop: 'ear_tag_right_colour', type: eInputType.text },
    { prop: 'ear_tag_left_id', type: eInputType.text },
    { prop: 'ear_tag_right_id', type: eInputType.text }
  ],
  mortalityFields: [
    { prop: 'mortality_date', type: eInputType.datetime },
    { prop: 'mortality_latitude', type: eInputType.number },
    { prop: 'mortality_longitude', type: eInputType.number },
    { prop: 'mortality_utm_zone', type: eInputType.number },
    { prop: 'mortality_utm_easting', type: eInputType.number },
    { prop: 'mortality_utm_northing', type: eInputType.number },
    { prop: 'mortality_comment', type: eInputType.text },
    { prop: 'proximate_cause_of_death', type: eInputType.code },
    { prop: 'ultimate_cause_of_death', type: eInputType.code },
    { prop: 'pcod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    { prop: 'ucod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    { prop: 'predator_species_pcod', type: eInputType.code, codeName: 'predator_species' },
    { prop: 'predator_species_ucod', type: eInputType.code, codeName: 'predator_species' },
    { prop: 'mortality_investigation', type: eInputType.code },
    { prop: 'mortality_report', type: eInputType.check },
    { prop: 'predator_known', type: eInputType.check }
  ],
  releaseFields: [
    { prop: 'release_date', type: eInputType.datetime },
    { prop: 'release_latitude', type: eInputType.number },
    { prop: 'release_longitude', type: eInputType.number },
    { prop: 'release_utm_zone', type: eInputType.number },
    { prop: 'release_utm_easting', type: eInputType.number },
    { prop: 'release_utm_northing', type: eInputType.number },
    { prop: 'translocation', type: eInputType.check },
    { prop: 'release_comment', type: eInputType.text }
  ],
  animalCommentField: [
    { prop: 'animal_comment', type: eInputType.multiline }
  ],
};

// a 'flatteneed' critterFormFields array
export const getAnimalFormFields = (): FormFieldObject<Partial<Animal>>[] => {
  return Object
    .values(critterFormFields)
    .reduce((previous, current) => ([ ...previous, ...current ]), []);
};
