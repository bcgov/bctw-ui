import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { createUrl } from './api_helpers';
import { API, ApiProps } from './api_interfaces';
import { ICbRoute } from 'critterbase/types';

export const critterbaseApi = (props: ApiProps): API => {
  const { api } = props;
  /**
   * retrieve the metadata history of an animal, given a @param id (critter_id)
   */
  const getLookupTableOptions = async (cbRoute: ICbRoute, asSelect?: boolean): Promise<unknown[]> => {
    const { route, formatRoute, formatResponse } = cbRoute;
    const { data } = await api.get(asSelect && formatRoute ? formatRoute : route);
    return data;
  };

  return {
    getLookupTableOptions
  };
};
