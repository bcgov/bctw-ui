import { CritterDetails } from 'types/animal';
import { uuid } from 'types/common_types';
import { CbRoutes } from './routes';

interface ICbSelect {
  key: string;
  id: uuid;
  value: string; // Maybe also number
}

type ICbRouteKey =
  | 'region_env'
  | 'region_nr'
  | 'wmu'
  | 'cod'
  | 'sex'
  | 'marking_materials'
  | 'marking_type'
  | 'collection_category'
  | 'critter_status'
  | 'cause_of_death_confidence'
  | 'coordinate_uncertainty_unit'
  | 'frequency_units'
  | 'measurement_units'
  | 'supported_systems';

// interface ICbRoute {
//   route: string;
// }

type ICbRoutes = Record<ICbRouteKey, string>;

export type { ICbSelect, ICbRoutes, ICbRouteKey };
