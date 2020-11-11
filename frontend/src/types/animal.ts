interface IAnimal {
  id: number;
  animal_id: string;
  animal_status: string;
  calf_at_heel: string;
  capture_date: Date;
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

class Animal implements IAnimal {
  public static getTitle(str: string): string {
    switch (str) {
      case 'id':
        return 'ID';
      case 'animal_id':
        return 'Animal ID';
      case 'nickname':
        return 'Nickname';
      case 'wlh_id':
        return 'WLH ID';
      case 'animal_status':
        return 'Status';
      case 'device_id':
        return 'Device ID';
      case 'calf_at_heel':
        return 'Calf at Heel';
      case 'capture_date':
        return 'Capture Date';
      case 'sex':
        return 'Sex';
      case 'species':
        return 'Species';
      case 'release_date':
        return 'Release Date';
    }
  }
  id: number;
  animal_id: string;
  animal_status: string;
  calf_at_heel: string;
  capture_date: Date;
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
export {
  Animal,
  IAnimal,
};
