import { CbRouters, CbRoutes, detailedFormat, selectFormat } from 'critterbase/routes';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { API, ApiProps, IUpsertPayload } from './api_interfaces';
import { uuid } from 'types/common_types';
import { Critter } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import { CbPayload } from 'types/events/event';

export const critterbaseApi = (props: ApiProps): API => {
  const { api } = props;
  /**
   * retrieve critterbase lookup table information, optionally formatted
   */
  const getLookupTableOptions = async (
    cbRouteKey: ICbRouteKey,
    asSelect?: boolean,
    query = ''
  ): Promise<Array<ICbSelect | string>> => {
    const route = CbRoutes[cbRouteKey];
    const q = asSelect ? (query ? `${selectFormat}&${query}` : `${selectFormat}`) : `?${query}`;
    const { data } = await api.get(`${route}${q}`);
    return data;
  };

  const upsertCritter = async (critter: IUpsertPayload<Critter>): Promise<Critter> => {
    // critter.body.sex = 'test';
    const { data } = await api.put(`${CbRouters.critters}/${critter.body.critter_id}${detailedFormat}`, critter.body);
    return data;
  };

  return {
    getLookupTableOptions,
    upsertCritter
  };
};
