import { columnToHeader } from 'utils/common';
import { BCTW, BctwBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';
import { eCritterPermission } from './user';
import { formatLatLong } from './common_helpers';

const assignedCritterProps = ['nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id'];
const unassignedCritterProps = ['nickname', 'animal_id', 'wlh_id', 'animal_status'];
const critterHistoryProps = [
  'nickname',
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
const editableAnimalProperties = [
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
  'nickname',
  'population_unit',
  're_capture',
  'region',
  'release_date',
  'sex',
  'species',
  'translocation',
  'wlh_id',
]

// properties re-used in Telemetry
export interface IAnimalTelemetryBase {
  species: string;
  wlh_id: string;
  animal_id: string;
  animal_status: string;
  population_unit: string;
  location: string;
}

export interface IAnimal extends BCTW, BctwBaseType, IAnimalTelemetryBase {
  critter_id: string;
  critter_transaction_id: string;
  animal_id: string;
  animal_status: string;
  capture_date: Date;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  ear_tag_left: string;
  ear_tag_right: string;
  estimated_age: number;
  juvenile_at_heel: string;
  life_stage: string;
  location: string;
  mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  nickname: string;
  population_unit: string;
  re_capture: boolean;
  region: string;
  release_date: Date;
  sex: string;
  species: string;
  translocation: boolean;
  wlh_id: string;
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
  @Type(() => Date) capture_date: Date;
  capture_latitude: number;
  capture_longitude: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  capture_utm_zone: number;
  ear_tag_left: string;
  ear_tag_right: string;
  estimated_age: number;
  juvenile_at_heel: string;
  life_stage: string;
  location: string;
  @Type(() => Date) mortality_date: Date;
  mortality_latitude: number;
  mortality_longitude: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  mortality_utm_zone: number;
  nickname: string;
  population_unit: string;
  re_capture: boolean;
  region: string;
  @Type(() => Date) release_date: Date;
  sex: string;
  species: string;
  translocation: boolean;
  wlh_id: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  permission_type: eCritterPermission;
  device_id?: number;
  @Expose() get identifier(): string {
    return 'critter_id';
  }
  @Expose() get name(): string {
    return this.nickname ?? this.wlh_id ?? this.animal_id;
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
    (this.juvenile_at_heel = 'N'), (this.population_unit = '');
    this.region = '';
    this.species = '';
    this.wlh_id = '';
    this.nickname = '';
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'animal_id':
        return 'Animal ID';
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
      default:
        return columnToHeader(str);
    }
  }
}

export {
  editableAnimalProperties,
  critterHistoryProps,
  unassignedCritterProps,
  assignedCritterProps,
}
