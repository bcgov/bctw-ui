import { Transform, Exclude } from 'class-transformer';
import { mustbePositiveNumber } from 'components/form/form_validators';
import { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import {
  BaseTimestamps,
  BCTWBase,
  DayjsToPlain,
  nullToDayjs,
  toClassOnly,
  toPlainOnly,
  uuid
} from 'types/common_types';
import { eInputType, FormFieldObject, isRequired } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { classToArray, columnToHeader } from 'utils/common_helpers';
import { ICollarHistory } from './collar_history';
import { DataLife } from './data_life';

// used in critter getters to specify collar attachment status
export enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned'
}

export interface ISpecies {
  id: string;
  //key: string,
  name: string;
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
    const keys = Object.keys(new Animal()).filter((k) => !(excluded as string[]).includes(k));
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
    this.critter_id = critter_id;
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
  device_status: string;
  latitude: number;
  longitude: number;
  @Exclude(toPlainOnly) attachment_start: Dayjs;
  @Exclude(toPlainOnly) data_life_start: Dayjs;
  @Exclude(toPlainOnly) data_life_end: Dayjs;
  @Exclude(toPlainOnly) attachment_end: Dayjs;

  get lastKnownLocation(): string {
    if (this.latitude && this.longitude) {
      return `${this.latitude.toFixed(2)} ${this.longitude.toFixed(2)}`;
    } else {
      return null;
    }
  }
  // con't overide since this class is inherited
  static get attachedCritterDisplayProps(): (keyof AttachedAnimal)[] {
    return [
      'animal_id',
      'device_status',
      'animal_status',
      'wlh_id',
      'device_id',
      'species',
      'frequency',
      'lastKnownLocation'
      // 'latitude',
      // 'longitude'
    ];
  }

  formatPropAsHeader(str: keyof Animal | keyof AttachedAnimal): string {
    if (str in Animal) {
      return super.formatPropAsHeader(str as keyof Animal);
    } else {
      switch (str) {
        case 'device_status':
          return 'Collar Status';
        case 'lastKnownLocation':
          return 'Last Lat Long';
        default:
          return columnToHeader(str);
      }
    }
  }
}

//Fixme: move this into a context that fetches from the DB to stay in sync.
export enum eSpecies {
  caribou = 'M-RATA',
  grizzly_bear = 'M-URAR',
  moose = 'M-ALAM',
  grey_wolf = 'M-CALU'
}

const { caribou } = eSpecies;
// species: [] represents field applies to all species, used for optimization on searching
export const critterFormFields: Record<string, FormFieldObject<Partial<Animal>>[]> = {
  speciesField: [{ prop: 'species', type: eInputType.code, species: [], ...isRequired }],
  associatedAnimalFields: [
    { prop: 'associated_animal_id', type: eInputType.text, species: [] },
    { prop: 'associated_animal_relationship', type: eInputType.code, species: [] }
  ],
  captureFields: [
    { prop: 'capture_date', type: eInputType.datetime, species: [] },
    { prop: 'capture_latitude', type: eInputType.number, species: [] },
    { prop: 'capture_longitude', type: eInputType.number, species: [] },
    { prop: 'capture_utm_zone', type: eInputType.number, species: [] },
    { prop: 'capture_utm_easting', type: eInputType.number, species: [] },
    { prop: 'capture_utm_northing', type: eInputType.number, species: [] },
    { prop: 'recapture', type: eInputType.check, species: [] },
    { prop: 'captivity_status', type: eInputType.check, species: [caribou] },
    { prop: 'capture_comment', type: eInputType.multiline, species: [] }
  ],
  characteristicsFields: [
    { prop: 'animal_status', type: eInputType.code, species: [], ...isRequired },
    //{ prop: 'species', type: eInputType.code, species: [...ALL_SPECIES], ...isRequired },
    { prop: 'sex', type: eInputType.code, species: [], ...isRequired },
    { prop: 'animal_colouration', type: eInputType.text, species: [] },
    { prop: 'estimated_age', type: eInputType.number, species: [], validate: mustbePositiveNumber },
    { prop: 'life_stage', type: eInputType.code, species: [] } //Species dependant, with code table
  ],
  characteristicFields2: [
    { prop: 'juvenile_at_heel', type: eInputType.code, species: [] },
    { prop: 'juvenile_at_heel_count', type: eInputType.number, species: [], validate: mustbePositiveNumber }
  ],
  identifierFields1: [
    { prop: 'wlh_id', type: eInputType.text, species: [] },
    { prop: 'animal_id', type: eInputType.text, species: [], ...isRequired },
    //Add nickname field for bears
    { prop: 'region', type: eInputType.code, species: [], ...isRequired },
    { prop: 'population_unit', type: eInputType.code, species: [] } //Population unit needs to be species dependant, surface with code table
  ],
  identifierFields2: [
    { prop: 'ear_tag_left_colour', type: eInputType.text, species: [] },
    { prop: 'ear_tag_right_colour', type: eInputType.text, species: [] },
    { prop: 'ear_tag_left_id', type: eInputType.text, species: [] },
    { prop: 'ear_tag_right_id', type: eInputType.text, species: [] }
  ],
  mortalityFields: [
    { prop: 'mortality_date', type: eInputType.datetime, species: [] },
    { prop: 'mortality_latitude', type: eInputType.number, species: [] },
    { prop: 'mortality_longitude', type: eInputType.number, species: [] },
    { prop: 'mortality_utm_zone', type: eInputType.number, species: [] },
    { prop: 'mortality_utm_easting', type: eInputType.number, species: [] },
    { prop: 'mortality_utm_northing', type: eInputType.number, species: [] },
    { prop: 'proximate_cause_of_death', type: eInputType.code, species: [caribou] },
    { prop: 'ultimate_cause_of_death', type: eInputType.code, species: [caribou] },
    { prop: 'pcod_confidence', type: eInputType.code, species: [caribou], codeName: 'cod_confidence' },
    { prop: 'ucod_confidence', type: eInputType.code, species: [caribou], codeName: 'cod_confidence' },
    { prop: 'predator_species_pcod', type: eInputType.code, species: [caribou], codeName: 'predator_species' },
    { prop: 'predator_species_ucod', type: eInputType.code, species: [caribou], codeName: 'predator_species' },
    { prop: 'mortality_investigation', type: eInputType.code, species: [caribou] },
    { prop: 'mortality_report', type: eInputType.check, species: [caribou] },
    { prop: 'predator_known', type: eInputType.check, species: [caribou] },
    { prop: 'mortality_comment', type: eInputType.multiline, species: [] }
  ],
  releaseFields: [
    { prop: 'release_date', type: eInputType.datetime, species: [] },
    { prop: 'release_latitude', type: eInputType.number, species: [] },
    { prop: 'release_longitude', type: eInputType.number, species: [] },
    { prop: 'release_utm_zone', type: eInputType.number, species: [] },
    { prop: 'release_utm_easting', type: eInputType.number, species: [] },
    { prop: 'release_utm_northing', type: eInputType.number, species: [] },
    { prop: 'translocation', type: eInputType.check, species: [] },
    { prop: 'release_comment', type: eInputType.multiline, species: [] }
  ],
  animalCommentField: [{ prop: 'animal_comment', type: eInputType.multiline, species: [] }]
};

// a 'flatteneed' critterFormFields array
export const getAnimalFormFields = (): FormFieldObject<Partial<Animal>>[] => {
  return Object.values(critterFormFields).reduce((previous, current) => [...previous, ...current], []);
};
