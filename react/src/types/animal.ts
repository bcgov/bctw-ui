import { columnToHeader } from 'utils/common_helpers';
import { BCTW, BCTWBaseType, PartialPick } from 'types/common_types';
import { Type, Expose, Transform } from 'class-transformer';
import { eCritterPermission } from 'types/permission';
import { formatLatLong } from 'utils/common_helpers';
import { eInputType, FormFieldObject } from 'types/form_types';
import { Collar } from './collar';

const assignedAnimalProps = ['species', 'population_unit', 'collective_unit', 'wlh_id', 'animal_id', 'device_id', 'frequency', 'animal_status'];
const unassignedAnimalProps = ['species', 'population_unit', 'collective_unit', 'wlh_id', 'animal_id', 'animal_status'];

// used in critter getters to specify collar attachment status
export enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned',
  all = 'all'
}

/**
 * Animal properties that are re-used in Telemetry classes (map.ts)
 */
export interface IAnimalTelemetryBase {
  animal_id: string;
  animal_status: string; // code
  capture_date: Date;
  collective_unit: string; // fixme: what is this
  map_colour: string; // code
  species: string; // code
  population_unit: string; // code
  wlh_id: string;
}

export interface IAnimal extends BCTW, BCTWBaseType, IAnimalTelemetryBase, PartialPick<Collar, 'collar_id' | 'device_id'> {
  animal_colouration: string;
  animal_comment: string;
  associated_animal_id: string;
  associated_animal_relationship: string; // code

  capture_comment: string;
  capture_time: Date; // todo:
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;

  critter_id: string;
  critter_transaction_id: string;
  ear_tag_left_id: string; 
  ear_tag_right_id: string;
  ear_tag_left_colour: string; // code
  ear_tag_right_colour: string; // code
  estimated_age: number;
  juvenile_at_heel: string; // code
  juvenile_at_heel_count: number;
  life_stage: string;

  mortality_comment: string;
  mortality_date: Date;
  mortality_time: Date; // todo:
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;

  permission_type?: eCritterPermission; // critters should contain this
  predator_species: string; // special species code fixme:
  proximate_cause_of_death: string; // code
  recapture: boolean; // what is this?
  region: string; // code

  release_comment: string;
  release_date: Date;
  release_time: Date; // todo:
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;

  sex: string;
  translocation: boolean;
  ultimate_cause_of_death: string; // code
}

const transformOpt = { toClassOnly: true };


export class Animal implements IAnimal {
  critter_id: string;
  critter_transaction_id: string;
  animal_id: string;
  animal_status: string;
  associated_animal_id: string;
  associated_animal_relationship: string; 
  capture_comment: string;
  @Type(() => Date) capture_date: Date;
  @Type(() => Date) capture_time: Date;
  @Transform((v) => v || -1, transformOpt) capture_latitude: number;
  @Transform((v) => v || -1, transformOpt) capture_longitude: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_zone: number;
  collective_unit: string;
  animal_colouration: string;
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  @Transform((value) => value || -1, transformOpt) estimated_age: number;
  juvenile_at_heel: string;
  @Transform((value) => value || -1, transformOpt) juvenile_at_heel_count: number;
  life_stage: string;
  map_colour: string;
  mortality_comment: string;
  @Type(() => Date) mortality_date: Date;
  @Type(() => Date) mortality_time: Date;
  @Transform((v) => v || -1, transformOpt) mortality_latitude: number;
  @Transform((v) => v || -1, transformOpt) mortality_longitude: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_zone: number;
  predator_species: string;
  proximate_cause_of_death: string;
  ultimate_cause_of_death: string;
  // @Transform((v) => v || '', transformOpt) population_unit: string;
  population_unit: string;
  // fixme: dont transform booleans?
  @Transform((v) => v || false, transformOpt) recapture: boolean;
  region: string;
  release_comment: string;
  @Type(() => Date) release_date: Date;
  @Type(() => Date) release_time: Date;
  @Transform((v) => v || -1, transformOpt) release_latitude: number;
  @Transform((v) => v || -1, transformOpt) release_longitude: number;
  @Transform((v) => v || -1, transformOpt) release_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) release_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) release_utm_zone: number;
  sex: string;
  species: string;
  // fixme: dont transform booleans?
  @Transform((v) => v || false, transformOpt) translocation: boolean;
  wlh_id: string;
  animal_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  permission_type: eCritterPermission;
  device_id?: number;
  collar_id?: string;
  @Expose() get identifier(): string {
    return 'critter_id';
  }
  @Expose() get name(): string {
    return this.wlh_id ?? this.animal_id;
  }
  @Expose() get mortalityCoords(): string {
    return this.mortality_latitude && this.mortality_longitude
      ? formatLatLong(this.mortality_latitude, this.mortality_longitude)
      : '';
  }
  @Expose() get mortalityUTM(): string {
    if (this.mortality_utm_zone && this.mortality_utm_easting && this.mortality_utm_northing) {
      return `${this.mortality_utm_zone}/${this.mortality_utm_easting}/${this.mortality_utm_northing}`;
    }
    return '';
  }
  @Expose() get captureCoords(): string {
    return this.capture_latitude && this.capture_longitude
      ? formatLatLong(this.capture_latitude, this.capture_longitude)
      : '';
  }
  @Expose() get captureUTM(): string {
    return this.capture_utm_zone && this.capture_utm_easting && this.capture_utm_northing
      ? `${this.capture_utm_zone}/${this.capture_utm_easting}/${this.capture_utm_northing}`
      : '';
  }

  constructor(aid?: string, status?: string, sp?: string, wlhid?: string) {
    this.animal_id = aid ?? '';
    this.animal_status = status ?? '';
    this.species = sp ?? '';
    this.wlh_id = wlhid ?? '';
  }

  toJSON(): Animal {
    delete this.map_colour;
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'captureCoords':
        return 'Coordinates (Lat/Long)';
      case 'captureUTM':
        return 'UTM';
      case 'collective_unit':
        return 'Collective Unit Name';
      case 'critter_id':
        return 'BCTW ID';
      case 'juvenile_at_heel':
        return 'Juvenile at Heel?';
      case 'mortalityCoords':
        return 'Coordinates (Lat/Long)';
      case 'mortalityUTM':
        return 'UTM';
      case 'population_unit':
        return 'Population Unit Name';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
}

// todo: handle required
const critterFormFields: Record<string, FormFieldObject<Animal>[]> = {
  associatedAnimalFields: [
    { prop: 'associated_animal_id', type: eInputType.text },
    { prop: 'associated_animal_relationship', type: eInputType.code }
  ],
  captureFields: [
    { prop: 'capture_date', type: eInputType.date, required: true, },
    { prop: 'capture_latitude', type: eInputType.number },
    { prop: 'capture_longitude', type: eInputType.number },
    { prop: 'capture_utm_zone', type: eInputType.number },
    { prop: 'capture_utm_easting', type: eInputType.number },
    { prop: 'capture_utm_northing', type: eInputType.number },
    { prop: 'recapture', type: eInputType.check }, // fixme: make code??
    { prop: 'capture_comment', type: eInputType.text }
  ],
  characteristicsFields: [
    { prop: 'animal_status', type: eInputType.code, required: true },
    { prop: 'species', type: eInputType.code, required: true },
    { prop: 'sex', type: eInputType.code },
    { prop: 'animal_colouration', type: eInputType.text },
    { prop: 'estimated_age', type: eInputType.number },
    { prop: 'life_stage', type: eInputType.code },
    { prop: 'juvenile_at_heel', type: eInputType.code },
    { prop: 'juvenile_at_heel_count', type: eInputType.number }
  ],
  identifierFields: [
    { prop: 'wlh_id', type: eInputType.text },
    { prop: 'animal_id', type: eInputType.text },
    { prop: 'region', type: eInputType.code },
    { prop: 'population_unit', type: eInputType.code },
    // { prop: 'collective_unit', type: eInputType.text }, // todo:
    { prop: 'ear_tag_left_colour', type: eInputType.text },
    { prop: 'ear_tag_right_colour', type: eInputType.text },
    { prop: 'ear_tag_left_id', type: eInputType.text },
    { prop: 'ear_tag_right_id', type: eInputType.text }
  ],
  mortalityFields: [
    { prop: 'mortality_date', type: eInputType.date },
    { prop: 'mortality_latitude', type: eInputType.date },
    { prop: 'mortality_longitude', type: eInputType.date },
    { prop: 'mortality_utm_zone', type: eInputType.date },
    { prop: 'mortality_utm_easting', type: eInputType.date },
    { prop: 'mortality_utm_northing', type: eInputType.date },
    { prop: 'proximate_cause_of_death', type: eInputType.code },
    { prop: 'ultimate_cause_of_death', type: eInputType.code },
    { prop: 'predator_species', type: eInputType.code },
    { prop: 'mortality_comment', type: eInputType.text }
  ],
  releaseFields: [
    { prop: 'release_date', type: eInputType.date },
    { prop: 'release_latitude', type: eInputType.number },
    { prop: 'release_longitude', type: eInputType.number },
    { prop: 'release_utm_zone', type: eInputType.number },
    { prop: 'release_utm_easting', type: eInputType.number },
    { prop: 'release_utm_northing', type: eInputType.number },
    { prop: 'translocation', type: eInputType.check },
    { prop: 'release_comment', type: eInputType.text }
  ],
  animalCommentField: [
    { prop: 'animal_comment', type: eInputType.text }
  ]
};

export { unassignedAnimalProps, assignedAnimalProps, critterFormFields, transformOpt };