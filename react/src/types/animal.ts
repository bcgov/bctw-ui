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

export enum etaxon {
  caribou = 'M-RATA',
  grizzly_bear = 'M-URAR',
  moose = 'M-ALAM',
  grey_wolf = 'M-CALU'
}

export enum eCritterStatus {
  alive = 'Alive',
  //in_translocation = 'In Translocation',
  mortality = 'Mortality'
  //potential_mortality = 'Potential Mortality'
}

const { caribou, grizzly_bear, moose, grey_wolf } = etaxon;

// used in critter getters to specify collar attachment status
export enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned'
}

export interface Itaxon {
  id: string;
  //key: string,
  name: string;
}
export type ICollectionUnit = Record<string, string>;
/**
 * Animal properties that are re-used in Telemetry classes (map.ts)
 */
export interface IAnimalTelemetryBase {
  animal_id: string;
  critter_status: eCritterStatus;
  capture_date: Dayjs | Date;
  collective_unit: string;
  map_colour: Code;
  taxon: string;
  collection_unit: ICollectionUnit[];
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
  mortality_report_ind: boolean;
  mortality_investigation: Code;
  captivity_status_ind: boolean;
  mortality_captivity_status_ind: boolean;

  permission_type?: eCritterPermission; // critters should contain this
  predator_known_ind: boolean;
  predator_taxon_pcod: Code;
  predator_taxon_ucod: Code;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  recapture_ind: boolean;
  region: Code;

  release_comment: string;
  release_date: Dayjs;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;

  sex: Code;
  translocation_ind: boolean;
  ultimate_cause_of_death: Code;
}

export class Animal implements BCTWBase<Animal>, IAnimal {
  readonly critter_id: uuid;
  @Exclude(toPlainOnly) critter_transaction_id: uuid;
  readonly _merged?: boolean;
  animal_id: string;
  critter_status: eCritterStatus;
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
  predator_known_ind: boolean;
  predator_taxon_pcod: Code;
  predator_taxon_ucod: Code;
  proximate_cause_of_death: Code;
  ucod_confidence: Code;
  pcod_confidence: Code;
  ultimate_cause_of_death: Code;
  collection_unit: ICollectionUnit[];
  recapture_ind: boolean;
  region: Code;
  release_comment: string;
  @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) release_date: Dayjs;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;
  sex: Code;
  taxon: string;
  translocation_ind: boolean;
  wlh_id: string;
  animal_comment: string;
  @Transform(nullToDayjs) last_transmission_date?: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_from: Dayjs;
  @Exclude(toPlainOnly) @Transform(nullToDayjs, toClassOnly) @Transform(DayjsToPlain, toPlainOnly) valid_to: Dayjs;
  @Exclude(toPlainOnly) owned_by_user_id: number;

  mortality_report_ind: boolean;
  mortality_investigation: Code;
  captivity_status_ind: boolean;
  mortality_captivity_status_ind: boolean;

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
    return ['taxon', 'collection_unit', 'wlh_id', 'animal_id', 'critter_status'];
    //return Animal.toCSVHeaderTemplate;
  }

  historyDisplayProps(): (keyof Animal)[] {
    const keys = Object.keys(new Animal()) as unknown as (keyof Animal)[];
    const startsWith = this.displayProps;
    const excludes = ['critter_id', 'critter_transaction_id'] as (keyof Animal)[];
    return classToArray(keys, startsWith, excludes);
  }

  tagColor(): string {
    switch (this.taxon.toLowerCase()) {
      case 'caribou':
        return '#9575cd';
      case 'moose':
        return '#64b5f6';
      case 'grey wolf':
        return '#4db6ac';
      case 'grizzly bear':
        return '#81c784';
      default:
        return '#bdbdbd';
    }
  }

  constructor(critter_id = '') {
    this.critter_id = critter_id;
  }
}

// animals attached to devices should have additional properties
export interface IAttachedAnimal extends IAnimal, ICollarHistory, DataLife {}

export class AttachedAnimal extends Animal implements IAttachedAnimal, BCTWBase<AttachedAnimal> {
  @Exclude(toPlainOnly) assignment_id: uuid;
  _merged: boolean;
  collar_id: uuid;
  device_id: number;
  device_make: Code;
  device_type: Code;
  frequency: number;
  device_status: string;
  latitude: number;
  longitude: number;
  @Exclude(toPlainOnly) attachment_start: Dayjs;
  @Exclude(toPlainOnly) data_life_start: Dayjs;
  @Exclude(toPlainOnly) data_life_end: Dayjs;
  @Exclude(toPlainOnly) attachment_end: Dayjs;
  @Transform(nullToDayjs) last_fetch_date?: Dayjs;
  @Transform(nullToDayjs) last_transmission_date?: Dayjs;

  get lastLatLong(): string {
    if (this.latitude && this.longitude) {
      return `${this.latitude.toFixed(2)} ${this.longitude.toFixed(2)}`;
    } else {
      return null;
    }
  }
  // con't overide since this class is inherited
  static get attachedCritterDisplayProps(): (keyof AttachedAnimal)[] {
    return [
      'taxon',
      'wlh_id',
      'animal_id',
      'device_status',
      'critter_status',
      'device_id',
      'frequency',
      'lastLatLong'
      // 'telemetry_updated',
      // 'last_fetch'
      //'lastKnownLocation'
      // 'latitude',
      // 'longitude'
    ];
  }

  static get attachedCritterExportProps(): (keyof AttachedAnimal)[] {
    return [
      'taxon',
      'wlh_id',
      'animal_id',
      'device_status',
      'critter_status',
      'device_id',
      'frequency',
      'latitude',
      'longitude'
    ];
  }

  tagColor(): string {
    return super.tagColor();
  }

  formatPropAsHeader(str: keyof Animal | keyof AttachedAnimal): string {
    if (str in Animal) {
      return super.formatPropAsHeader(str as keyof Animal);
    } else {
      switch (str) {
        case 'device_status':
          return 'Collar Status';
        case 'lastLatLong':
          return 'Last Lat Long';
        case 'last_transmission_date':
          return 'Last Transmission';
        case 'last_fetch_date':
          return 'Last Update Attempt';
        default:
          return columnToHeader(str);
      }
    }
  }
}

// taxon: [] represents field applies to all taxon, used for optimization on searching
export const critterFormFields: Record<string, FormFieldObject<Partial<Animal>>[]> = {
  taxonField: [{ prop: 'taxon', type: eInputType.code, taxon: [], ...isRequired }],
  associatedAnimalFields: [
    { prop: 'associated_animal_id', type: eInputType.text, taxon: [] },
    { prop: 'associated_animal_relationship', type: eInputType.code, taxon: [] }
  ],
  captureFields: [
    { prop: 'capture_date', type: eInputType.datetime, taxon: [] },
    { prop: 'capture_latitude', type: eInputType.number, taxon: [] },
    { prop: 'capture_longitude', type: eInputType.number, taxon: [] },
    { prop: 'capture_utm_zone', type: eInputType.number, taxon: [] },
    { prop: 'capture_utm_easting', type: eInputType.number, taxon: [] },
    { prop: 'capture_utm_northing', type: eInputType.number, taxon: [] },
    { prop: 'recapture_ind', type: eInputType.check, taxon: [] },
    { prop: 'captivity_status_ind', type: eInputType.check, taxon: [caribou] },
    { prop: 'capture_comment', type: eInputType.multiline, taxon: [] }
  ],
  characteristicsFields: [
    { prop: 'critter_status', type: eInputType.code, taxon: [], ...isRequired },
    //{ prop: 'taxon', type: eInputType.code, taxon: [...ALL_taxon], ...isRequired },
    { prop: 'sex', type: eInputType.code, taxon: [], ...isRequired },
    { prop: 'animal_colouration', type: eInputType.text, taxon: [] },
    { prop: 'estimated_age', type: eInputType.number, taxon: [], validate: mustbePositiveNumber },
    { prop: 'life_stage', type: eInputType.code, taxon: [] } //taxon dependant, with code table
  ],
  characteristicFields2: [
    { prop: 'juvenile_at_heel', type: eInputType.code, taxon: [] },
    { prop: 'juvenile_at_heel_count', type: eInputType.number, taxon: [], validate: mustbePositiveNumber }
  ],
  identifierFields1: [
    { prop: 'wlh_id', type: eInputType.text, taxon: [] },
    { prop: 'animal_id', type: eInputType.text, taxon: [], ...isRequired },
    //Add nickname field for bears
    { prop: 'region', type: eInputType.code, taxon: [], ...isRequired },
    { prop: 'collection_unit', type: eInputType.code, taxon: [] } //Population unit needs to be taxon dependant, surface with code table
  ],
  identifierFields2: [
    { prop: 'ear_tag_left_colour', type: eInputType.text, taxon: [] },
    { prop: 'ear_tag_right_colour', type: eInputType.text, taxon: [] },
    { prop: 'ear_tag_left_id', type: eInputType.text, taxon: [] },
    { prop: 'ear_tag_right_id', type: eInputType.text, taxon: [] }
  ],
  mortalityFields: [
    { prop: 'mortality_date', type: eInputType.datetime, taxon: [] },
    { prop: 'mortality_latitude', type: eInputType.number, taxon: [] },
    { prop: 'mortality_longitude', type: eInputType.number, taxon: [] },
    { prop: 'mortality_utm_zone', type: eInputType.number, taxon: [] },
    { prop: 'mortality_utm_easting', type: eInputType.number, taxon: [] },
    { prop: 'mortality_utm_northing', type: eInputType.number, taxon: [] },
    { prop: 'proximate_cause_of_death', type: eInputType.code, taxon: [caribou] },
    { prop: 'ultimate_cause_of_death', type: eInputType.code, taxon: [caribou] },
    { prop: 'pcod_confidence', type: eInputType.code, taxon: [caribou], codeName: 'cod_confidence' },
    { prop: 'ucod_confidence', type: eInputType.code, taxon: [caribou], codeName: 'cod_confidence' },
    { prop: 'predator_taxon_pcod', type: eInputType.code, taxon: [caribou], codeName: 'predator_taxon' },
    { prop: 'predator_taxon_ucod', type: eInputType.code, taxon: [caribou], codeName: 'predator_taxon' },
    { prop: 'mortality_investigation', type: eInputType.code, taxon: [caribou] },
    { prop: 'mortality_report_ind', type: eInputType.check, taxon: [caribou] },
    { prop: 'predator_known_ind', type: eInputType.check, taxon: [caribou] },
    { prop: 'mortality_comment', type: eInputType.multiline, taxon: [] }
  ],
  releaseFields: [
    { prop: 'release_date', type: eInputType.datetime, taxon: [] },
    { prop: 'release_latitude', type: eInputType.number, taxon: [] },
    { prop: 'release_longitude', type: eInputType.number, taxon: [] },
    { prop: 'release_utm_zone', type: eInputType.number, taxon: [] },
    { prop: 'release_utm_easting', type: eInputType.number, taxon: [] },
    { prop: 'release_utm_northing', type: eInputType.number, taxon: [] },
    { prop: 'translocation_ind', type: eInputType.check, taxon: [] },
    { prop: 'release_comment', type: eInputType.multiline, taxon: [] }
  ],
  animalCommentField: [{ prop: 'animal_comment', type: eInputType.multiline, taxon: [] }]
};

// a 'flatteneed' critterFormFields array
export const getAnimalFormFields = (): FormFieldObject<Partial<Animal>>[] => {
  return Object.values(critterFormFields).reduce((previous, current) => [...previous, ...current], []);
};
