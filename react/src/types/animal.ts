import { columnToHeader } from 'utils/common';
import { BCTW, BctwBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import { eCritterPermission } from './user';
import { formatLatLong } from './common_helpers';

const assignedCritterProps = ['animal_id', 'wlh_id', 'animal_status', 'device_id'];
const unassignedCritterProps = ['animal_id', 'wlh_id', 'animal_status'];
// props to show in the animal history modal
const critterHistoryProps = [
  'animal_id',
  'wlh_id',
  'animal_status',
  'juvenile_at_heel',
  'region',
  'population_unit',
  'valid_from',
  'valid_to'
];

// export/import properties
const exportableAnimalProperties = [
  'critter_id',
  'animal_id',
  'animal_status',
  'capture_date',
  'capture_latitude',
  'capture_longitude',
  'capture_utm_easting',
  'capture_utm_northing',
  'capture_utm_zone',
  'ear_tag_left',
  'ear_tag_right',
  'estimated_age',
  'juvenile_at_heel',
  'life_stage',
  'location',
  'mortality_date',
  'mortality_latitude',
  'mortality_longitude',
  'mortality_utm_zone',
  'mortality_utm_easting',
  'mortality_utm_northing',
  'population_unit',
  're_capture',
  'region',
  'release_date',
  'sex',
  'species',
  'translocation',
  'wlh_id',
  'device_id',
]

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

export interface IAnimal extends BCTW, BctwBaseType, IAnimalTelemetryBase {
  critter_id: string;
  critter_transaction_id: string;
  animal_id: string;
  animal_status: string;
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
  map_colour: string;
  mortality_comment: string;
  mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  probable_cause_of_death: string;
  ultimate_cause_of_death: string;
  population_unit: string;
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
  species: string;
  translocation: boolean;
  wlh_id: string;
  user_comment: string;
  // adding device_id for enabling bulk import of critters
  device_id?: number;
  // fetched critters should contain this
  permission_type?: eCritterPermission;
}

export class Animal implements IAnimal {
  critter_id: string;
  critter_transaction_id: string;
  animal_id: string;
  animal_status: string;
  associated_animal_id: string;
  associated_animal_relationship: string;
  capture_comment: string;
  @Type(() => Date) capture_date: Date;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  collective_unit: string;
  animal_colouration: string;
  ear_tag_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  estimated_age: number;
  juvenile_at_heel: string;
  life_stage: string;
  map_colour: string;
  mortality_comment: string;
  @Type(() => Date) mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  probable_cause_of_death: string;
  ultimate_cause_of_death: string;
  population_unit: string;
  recapture: boolean;
  region: string;
  release_comment: string;
  release_latitude: number;
  release_longitude: number;
  release_utm_easting: number;
  release_utm_northing: number;
  release_utm_zone: number;
  @Type(() => Date) release_date: Date;
  sex: string;
  species: string;
  translocation: boolean;
  wlh_id: string;
  user_comment: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  permission_type: eCritterPermission;
  device_id?: number;
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
      ? `${this.capture_utm_zone}/${this.capture_utm_easting}/${this.capture_utm_northing}`: '';
  }

  constructor() {
    this.animal_id = '';
    this.animal_status = '';
    (this.population_unit = '');
    this.region = '';
    this.species = '';
    this.wlh_id = '';
    this.capture_date = new Date();
    this.mortality_date = new Date();
    this.release_date = new Date();
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'animal_id':
        return 'Animal ID';
      case 'device_id':
        return 'Device ID';
      case 'wlh_id':
        return 'WLH ID';
      case 'juvenile_at_heel':
        return 'Calf Status';
      case 'population_unit':
        return 'Population';
      case 'mortalityCoords':
      case 'captureCoords':
        return 'Coordinates (Lat/Long)'
      case 'mortalityUTM':
      case 'captureUTM':
        return 'UTM'
      case 'animal_colour':
        return 'Colour';
      default:
        return columnToHeader(str);
    }
  }
}

export {
  exportableAnimalProperties,
  critterHistoryProps,
  unassignedCritterProps,
  assignedCritterProps,
}
