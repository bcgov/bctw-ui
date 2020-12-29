import { columnToHeader } from 'utils/common';
import { BCTW } from 'types/common_types';
import { Type } from 'class-transformer';

export const assignedCritterProps = ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id'];
export const unassignedCritterProps = ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status'];

export interface IAnimal extends BCTW {
  id: number;
  animal_id: string;
  animal_status: string;
  calf_at_heel: boolean;
  capture_date_day: number;
  capture_date_year: number;
  capture_date_month: number;
  capture_utm_zone: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  ecotype: string;
  population_unit: string;
  ear_tag_left: string;
  ear_tag_right: string;
  life_stage: string;
  management_area: string;
  mortality_date: Date;
  mortality_utm_zone: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  project: string;
  re_capture: boolean;
  region: string;
  regional_contact: string;
  release_date: Date;
  sex: string;
  species: string;
  trans_location: boolean;
  wlh_id: string;
  nickname: string;
}

export class Animal implements IAnimal {
  id: number;
  animal_id: string;
  animal_status: string;
  calf_at_heel: boolean;
  capture_date_day: number;
  capture_date_year: number;
  capture_date_month: number;
  capture_utm_zone: number;
  capture_utm_easting: number;
  capture_utm_northing: number;
  ecotype: string;
  population_unit: string;
  ear_tag_left: string;
  ear_tag_right: string;
  life_stage: string;
  management_area: string;
  @Type(() => Date) mortality_date: Date;
  mortality_utm_zone: number;
  mortality_utm_easting: number;
  mortality_utm_northing: number;
  project: string;
  re_capture: boolean;
  region: string;
  regional_contact: string;
  @Type(() => Date)release_date: Date;
  sex: string;
  species: string;
  trans_location: boolean;
  wlh_id: string;
  nickname: string;

  constructor() {
    this.animal_id = '';
    this.animal_status = '';
    this.calf_at_heel = false;
    this.population_unit = '';
    this.region = '';
    this.species = '';
    this.wlh_id = '';
    this.nickname = '';
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'id':
        return 'ID';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  }
}
