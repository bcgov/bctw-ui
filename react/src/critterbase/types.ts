import { CritterDetails } from 'types/animal';
import { uuid } from 'types/common_types';
import { CbRoutes } from './routes';

interface ICbSelect {
  key: string;
  id: uuid;
  value: string; // Maybe also number
}

type ICbRouteResponse = 'select' | 'enum';

type ICbEnums =
  | 'coordinate_uncertainty_unit'
  | 'cause_of_death_confidence'
  | 'frequency_units'
  | 'measurement_units'
  | 'supported_systems';

//TODO hopefully these will be included in the CritterDetails class
type ICbTempKeys =
  | 'wmu'
  | 'region_env'
  | 'region_nr'
  | 'cod_id'
  | 'marking_materials_id'
  | 'marking_type_id'
  | 'collection_category_id';

type ICbRoute =
  | {
      route: string;
      formatRoute?: never;
      formatResponse?: never;
    }
  | {
      route: string;
      formatRoute: string;
      formatResponse: ICbRouteResponse;
    };

type ICbRoutes = {
  [key in keyof CritterDetails | ICbEnums | ICbTempKeys]?: ICbRoute;
};

type ICbRoutesKey = keyof typeof CbRoutes;

// type ICbRouteReturnType<RouteKey extends ICbRoutesKey> = ICbRoutes[RouteKey]['formatResponse'] extends 'select'
//   ? ICbSelect
//   : string;
// // : ICbRoutes[ICbRoutesKey]['formatResponse'] extends 'enum'
// // ? string
// // : any;

export type { ICbSelect, ICbRouteResponse, ICbRoute, ICbRoutes, ICbRoutesKey };
