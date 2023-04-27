import { CbRoutes, selectFormat } from 'critterbase/routes';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { API, ApiProps } from './api_interfaces';

export const critterbaseApi = (props: ApiProps): API => {
  const { api } = props;
  /**
   * retrieve the metadata history of an animal, given a @param id (critter_id)
   */
  const getLookupTableOptions = async (
    cbRouteKey: ICbRouteKey,
    asSelect?: boolean
  ): Promise<Array<ICbSelect | string>> => {
    const route = CbRoutes[cbRouteKey];
    const { data } = await api.get(asSelect ? `${route}${selectFormat}` : route);
    return data;
  };

  return {
    getLookupTableOptions
  };
};
