import { uuid } from 'types/common_types';

interface ICbSelect {
  key: string;
  id: uuid;
  value: string; // Maybe also number
}

type ICbRouteKey =
  | 'region_env'
  | 'region_nr'
  | 'colours'
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
  | 'supported_systems'
  | 'taxons'
  | 'species'
  | 'collection_units'
  | 'taxon_collection_categories'
  | 'taxon_marking_body_locations';

// interface ICbRoute {
//   route: string;
// }

type ICbRoutes = Record<ICbRouteKey, string>;

export type { ICbSelect, ICbRoutes, ICbRouteKey };
