import { CbRouters, CbRoutes, detailedFormat, selectFormat } from 'critterbase/routes';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { API, ApiProps, ICbBulkUpdatePayload, IUpsertPayload } from './api_interfaces';
import { uuid } from 'types/common_types';
import { Critter } from 'types/animal';
import { CaptureEvent2 } from 'types/events/capture_event';
import { CbPayload } from 'types/events/event';
import { useQueryClient } from 'react-query';

export const critterbaseApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('critters_assigned');
    qc.invalidateQueries('critters_unassigned');
    qc.invalidateQueries('getType');
    qc.invalidateQueries('pings');
  };
  /**
   * retrieve critterbase lookup table information, optionally formatted
   */
  const getLookupTableOptions = async (
    cbRouteKey: ICbRouteKey,
    asSelect?: boolean
  ): Promise<Array<ICbSelect | string>> => {
    const route = CbRoutes[cbRouteKey];
    const { data } = await api.get(asSelect ? `${route}${selectFormat}` : route);
    return data;
  };

  const upsertCritter = async (critter: IUpsertPayload<Critter>): Promise<Critter> => {
    // critter.body.sex = 'test';
    const { data } = await api.put(`${CbRouters.critters}/${critter.body.critter_id}${detailedFormat}`, critter.body);
    return data;
  };

  const bulkUpdate = async (bulkPayload: ICbBulkUpdatePayload) => {
    const { data } = await api.put(`${CbRouters.bulk}`, bulkPayload);
    invalidate();
    return data;
  }


  return {
    getLookupTableOptions,
    upsertCritter,
    bulkUpdate
  };
};
