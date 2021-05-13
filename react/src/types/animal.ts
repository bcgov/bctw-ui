import { columnToHeader } from 'utils/common';
import { BCTW, BCTWBaseType } from 'types/common_types';
import { Type, Expose, Transform } from 'class-transformer';
import { eCritterPermission } from 'types/user';
import { formatLatLong } from 'types/common_helpers';
import { FormFieldObject } from 'types/form_types';

const assignedCritterProps = ['animal_id', 'wlh_id', 'animal_status', 'device_id'];
const unassignedCritterProps = ['animal_id', 'wlh_id', 'animal_status'];

// properties re-used in Telemetry
export interface IAnimalTelemetryBase {
  species: string;
  wlh_id: string;
  map_colour: string;
  animal_id: string;
  animal_status: string;
  population_unit: string;
  capture_date: Date;
  collective_unit: string;
}

// animals attached to devices should have these properties
interface IOptionallyAttachedDevice {
  collar_id?: string;
  device_id?: number;
}
export interface IAnimal extends BCTW, BCTWBaseType, IAnimalTelemetryBase, IOptionallyAttachedDevice {
  critter_id: string;
  critter_transaction_id: string;
  associated_animal_id: string;
  associated_animal_relationship: string;
  capture_comment: string;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  animal_colouration: string;
  ear_tag_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  estimated_age: number;
  juvenile_at_heel: string;
  life_stage: string;
  mortality_comment: string;
  mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  probable_cause_of_death: string;
  ultimate_cause_of_death: string;
  recapture: boolean;
  region: string;
  release_comment: string;
  release_date: Date;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;
  sex: string;
  translocation: boolean;
  user_comment: string;
  // fetched critters should contain this
  permission_type?: eCritterPermission;
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
  @Transform((v) => v || -1, transformOpt) capture_latitude: number;
  @Transform((v) => v || -1, transformOpt) capture_longitude: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) capture_utm_zone: number;
  collective_unit: string;
  animal_colouration: string;
  ear_tag_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  @Transform((value) => value || -1, transformOpt) estimated_age: number;
  juvenile_at_heel: string;
  life_stage: string;
  map_colour: string;
  mortality_comment: string;
  @Type(() => Date) mortality_date: Date;
  @Transform((v) => v || -1, transformOpt) mortality_latitude: number;
  @Transform((v) => v || -1, transformOpt) mortality_longitude: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) mortality_utm_zone: number;
  probable_cause_of_death: string;
  ultimate_cause_of_death: string;
  @Transform((v) => v || '', transformOpt) population_unit: string;
  @Transform((v) => v || false, transformOpt) recapture: boolean;
  region: string;
  release_comment: string;
  @Transform((v) => v || -1, transformOpt) release_latitude: number;
  @Transform((v) => v || -1, transformOpt) release_longitude: number;
  @Transform((v) => v || -1, transformOpt) release_utm_easting: number;
  @Transform((v) => v || -1, transformOpt) release_utm_northing: number;
  @Transform((v) => v || -1, transformOpt) release_utm_zone: number;
  @Type(() => Date) release_date: Date;
  sex: string;
  species: string;
  @Transform((v) => v || false, transformOpt) translocation: boolean;
  wlh_id: string;
  user_comment: string;
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

  constructor() {
    this.animal_id = '';
    this.animal_status = '';
    this.region = '';
    this.species = '';
    this.wlh_id = '';
  }

  toJSON(): Animal {
    delete this.map_colour;
    return this;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'probable_cause_of_death':
        return 'Proximate Cause of Death';
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'juvenile_at_heel':
        return 'Juvenile at Heel?';
      case 'mortalityCoords':
      case 'captureCoords':
        return 'Coordinates (Lat/Long)';
      case 'mortalityUTM':
      case 'captureUTM':
        return 'UTM';
      default:
        return columnToHeader(str);
    }
  }
}

const critterFormFields: Record<string, FormFieldObject[]> = {
  associatedAnimalFields: [
    { prop: 'associated_animal_id' },
    { prop: 'associated_animal_relationship' /*, isCode: true */ }
  ],
  captureFields: [
    { prop: 'capture_date', required: true, isDate: true },
    { prop: 'capture_latitude' },
    { prop: 'capture_longitude' },
    { prop: 'capture_utm_zone' },
    { prop: 'capture_utm_easting' },
    { prop: 'capture_utm_northing' },
    { prop: 'region', isCode: true /*, required: true */ },
    { prop: 'recapture', isBool: true },
    { prop: 'capture_comment' }
  ],
  characteristicsFields: [
    { prop: 'animal_status', isCode: true, required: true },
    { prop: 'species', isCode: true, required: true },
    { prop: 'sex', isCode: true },
    { prop: 'animal_colouration' },
    { prop: 'estimated_age' },
    { prop: 'life_stage', isCode: true },
    { prop: 'juvenile_at_heel', isCode: true }
  ],
  // to show in the animal history modal
  historyProps: [
    { prop: 'animal_id' },
    { prop: 'wlh_id' },
    { prop: 'animal_status' },
    { prop: 'juvenile_at_heel' },
    { prop: 'region' },
    { prop: 'population_unit' },
    { prop: 'valid_from' },
    { prop: 'valid_to' }
  ],
  identifierFields: [
    { prop: 'wlh_id' },
    { prop: 'animal_id' },
    { prop: 'population_unit', isCode: true },
    { prop: 'collective_unit' },
    { prop: 'ear_tag_left_colour' /*, isCode: true */ },
    { prop: 'ear_tag_right_colour' /*, isCode: true */ },
    { prop: 'ear_tag_id' },
  ],
  mortalityFields: [
    { prop: 'mortality_date', isDate: true /*, required: true */ },
    { prop: 'mortality_latitude' }, 
    { prop: 'mortality_longitude' },
    { prop: 'mortality_utm_zone' },
    { prop: 'mortality_utm_easting' },
    { prop: 'mortality_utm_northing' },
    { prop: 'probable_cause_of_death' },
    { prop: 'ultimate_cause_of_death' },
    { prop: 'mortality_comment' },
  ],
  releaseFields: [
    { prop: 'release_date', isDate: true /*, required: true */ },
    { prop: 'release_latitude' }, 
    { prop: 'release_longitude' },
    { prop: 'release_utm_zone' },
    { prop: 'release_utm_easting' },
    { prop: 'release_utm_northing' },
    { prop: 'translocation' },
    { prop: 'release_comment' },
  ],
  userCommentField : [
    { prop: 'user_comment' }
  ]
};

export { unassignedCritterProps, assignedCritterProps, critterFormFields, transformOpt };