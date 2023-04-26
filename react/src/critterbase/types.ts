import { CritterDetails } from 'types/animal';
import { uuid } from 'types/common_types';

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
  [key in keyof CritterDetails | ICbEnums]?: ICbRoute;
};

export type { ICbSelect, ICbRouteResponse, ICbRoute, ICbRoutes };
