import { CbRouters, CbRoutes, detailedFormat, selectFormat } from 'critterbase/routes';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { API, ApiProps, ICbBulkUpdatePayload, IUpsertPayload } from './api_interfaces';
import { uuid } from 'types/common_types';
import { Critter, IMarking } from 'types/animal';
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

  const bulkUpdate = async (bulkPayload: ICbBulkUpdatePayload) => {
    const { data } = await api.put(`${CbRouters.bulk}`, bulkPayload);
    invalidate();
    return data;
  };

  const deleteMarking = async (marking_id: uuid): Promise<IMarking> => {
    const { data } = await api.delete(`${CbRouters.markings}/${marking_id}`);
    return data;
  };

  const loginToCritterbase = async (system_user_id: string | undefined, keycloak_id: string | undefined): Promise<Record<string, unknown>> => {
    try {
      const { data } = await api.post(`${CbRouters.login}`, {system_user_id: system_user_id, keycloak_uuid: keycloak_id, system_name: 'BCTW'});
      return data;
    }
    catch(e) {
      const { data } = await api.post(`${CbRouters.signup}`, {system_user_id: system_user_id, keycloak_uuid: keycloak_id, system_name: 'BCTW'});
      return data;
    }
  }

  return {
    getLookupTableOptions,
    upsertCritter,
    bulkUpdate,
    deleteMarking,
    loginToCritterbase
  };
};
