import { columnToHeader } from '../components/component_helpers';

const assignedCritterProps = ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status', 'device_id'];
const unassignedCritterProps = ['id', 'nickname', 'animal_id', 'wlh_id', 'animal_status'];
interface Animal {
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

function encodeCritter(obj: Animal) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null) {
      delete obj[key];
    }
  }
  return obj;
}

const getCritterTitle = (str: string): string => {
    switch (str) {
      case 'id':
        return 'ID';
      case 'wlh_id':
        return 'WLH ID';
      default:
        return columnToHeader(str);
    }
  };

export {
  Animal,
  assignedCritterProps,
  unassignedCritterProps,
  encodeCritter,
  getCritterTitle,
};
