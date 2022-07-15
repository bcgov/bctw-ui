import { Transform, Exclude } from 'class-transformer';
import { mustbePositiveNumber } from 'components/form/form_validators';
import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { BaseTimestamps, BCTWBase, DayjsToPlain, nullToDayjs, toClassOnly, toPlainOnly, uuid } from 'types/common_types';
import { eInputType, FormFieldObject, isRequired } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { classToArray, columnToHeader } from 'utils/common_helpers';
import { ICollarHistory } from './collar_history';
import { DataLife } from './data_life';

export enum species {
  caribou = 'caribou',
  grizzly_bear = 'grizzly bear',
  moose = 'moose',
}
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
  collective_unit: string;
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
  @Exclude(toPlainOnly) critter_transaction_id: uuid;
  animal_id: string;
  animal_status: Code;
  associated_animal_id: string;
  associated_animal_relationship: Code;
  capture_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) capture_date: Dayjs;
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
  @Exclude(toPlainOnly) map_colour: Code;
  mortality_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) mortality_date: Dayjs;
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
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) release_date: Dayjs;
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
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_from: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_to: Dayjs;
  @Exclude(toPlainOnly) owned_by_user_id: number;

  mortality_report: boolean;
  mortality_investigation: Code;
  captivity_status: boolean;
  mortality_captivity_status: Code;

  @Exclude(toPlainOnly) permission_type: eCritterPermission;

  get identifier(): keyof Animal {
    return 'critter_id';
  }
  get name(): string {
    return this.wlh_id ?? this.animal_id;
  }

  static get toCSVHeaderTemplate(): string[] {
    const excluded: (keyof Animal)[] = ['critter_transaction_id'];
    const keys = Object.keys(new Animal()).filter(k => !(excluded as string[]).includes(k));
    return keys;
  }

  toJSON(): Animal {
    const n = Object.assign(new Animal(), this);
    delete n.permission_type;
    delete n.map_colour;
    delete n.valid_from;
    delete n.valid_to;
    delete n.owned_by_user_id;
    return n;
  }

  formatPropAsHeader(str: keyof Animal): string {
    switch (str) {
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'collective_unit':
        return 'Collective Unit Name';
      case 'juvenile_at_heel_count':
        return 'Juvenile Count';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
  
  get displayProps(): (keyof Animal)[] {
    return ['species', 'population_unit', 'wlh_id', 'animal_id', 'animal_status'];
    //return Animal.toCSVHeaderTemplate;
  }

  historyDisplayProps(): (keyof Animal)[] {
    const keys = Object.keys(new Animal()) as unknown as (keyof Animal)[];
    const startsWith = this.displayProps;
    const excludes = ['critter_id', 'critter_transaction_id'] as (keyof Animal)[];
    return classToArray(keys, startsWith, excludes);
  }

  constructor(critter_id = '') {
    this.critter_id = critter_id ;
  }
}

// animals attached to devices should have additional properties
export interface IAttachedAnimal extends IAnimal, ICollarHistory, DataLife {}

export class AttachedAnimal extends Animal implements IAttachedAnimal, BCTWBase<AttachedAnimal> {
  @Exclude(toPlainOnly) assignment_id: uuid;
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  frequency: number;

  @Exclude(toPlainOnly) attachment_start: Dayjs;
  @Exclude(toPlainOnly) data_life_start: Dayjs;
  @Exclude(toPlainOnly) data_life_end: Dayjs;
  @Exclude(toPlainOnly) attachment_end: Dayjs;

  // con't overide since this class is inherited
  static get attachedCritterDisplayProps(): (keyof AttachedAnimal)[] {
    return ['species', 'population_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency'];
    
  }

  formatPropAsHeader(str: keyof Animal): string {
    return super.formatPropAsHeader(str);
  }
}
const {caribou, grizzly_bear, moose} = species;
const ALL_SPECIES = Object.values(species);
export const critterFormFields: Record<string, FormFieldObject<Partial<Animal>>[]> = {
  associatedAnimalFields: [
    { prop: 'associated_animal_id', type: eInputType.text},
    { prop: 'associated_animal_relationship', type: eInputType.code }
  ],
  captureFields: [
    { prop: 'capture_date', type: eInputType.datetime, species: [caribou] },
    { prop: 'capture_latitude', type: eInputType.number, species: [caribou] },
    { prop: 'capture_longitude', type: eInputType.number, species: [caribou] },
    { prop: 'capture_utm_zone', type: eInputType.number, species: [caribou] },
    { prop: 'capture_utm_easting', type: eInputType.number, species: [caribou] },
    { prop: 'capture_utm_northing', type: eInputType.number, species: [caribou] },
    { prop: 'recapture', type: eInputType.check, species: [caribou] },
    { prop: 'captivity_status', type: eInputType.check, species: [caribou] },
    { prop: 'capture_comment', type: eInputType.multiline, species: [caribou] },
  ],
  characteristicsFields: [
    { prop: 'animal_status', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired},
    { prop: 'species', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired },
    { prop: 'sex', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired },
    { prop: 'animal_colouration', type: eInputType.text, species: [...ALL_SPECIES], },
    { prop: 'estimated_age', type: eInputType.number, species: [...ALL_SPECIES], validate: mustbePositiveNumber },
    { prop: 'life_stage', type: eInputType.code, species: [...ALL_SPECIES], },
  ],
  characteristicFields2: [
    { prop: 'juvenile_at_heel', type: eInputType.code, species: [...ALL_SPECIES]},
    { prop: 'juvenile_at_heel_count', type: eInputType.number, species: [...ALL_SPECIES], validate: mustbePositiveNumber}
  ],
  identifierFields1: [
    { prop: 'wlh_id', type: eInputType.text, species: [...ALL_SPECIES] },
    { prop: 'animal_id', type: eInputType.text, species: [...ALL_SPECIES], ...isRequired },
    { prop: 'region', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired },
    { prop: 'population_unit', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired },
  ],
  identifierFields2: [
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
    { prop: 'proximate_cause_of_death', type: eInputType.code },
    { prop: 'ultimate_cause_of_death', type: eInputType.code },
    { prop: 'pcod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    { prop: 'ucod_confidence', type: eInputType.code, codeName: 'cod_confidence' },
    { prop: 'predator_species_pcod', type: eInputType.code, codeName: 'predator_species' },
    { prop: 'predator_species_ucod', type: eInputType.code, codeName: 'predator_species' },
    { prop: 'mortality_investigation', type: eInputType.code },
    { prop: 'mortality_report', type: eInputType.check },
    { prop: 'predator_known', type: eInputType.check },
    { prop: 'mortality_comment', type: eInputType.multiline},
  ],
  releaseFields: [
    { prop: 'release_date', type: eInputType.datetime },
    { prop: 'release_latitude', type: eInputType.number },
    { prop: 'release_longitude', type: eInputType.number },
    { prop: 'release_utm_zone', type: eInputType.number },
    { prop: 'release_utm_easting', type: eInputType.number },
    { prop: 'release_utm_northing', type: eInputType.number },
    { prop: 'translocation', type: eInputType.check },
    { prop: 'release_comment', type: eInputType.multiline }
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
