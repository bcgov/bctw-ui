import { CbRouters, CbRoutes, detailedFormat, selectFormat } from 'critterbase/routes';
import { ICbRouteKey, ICbSelect } from 'critterbase/types';
import { useQueryClient } from 'react-query';
import { Critter, IMarking } from 'types/animal';
import { uuid } from 'types/common_types';
import { createUrl } from './api_helpers';
import { API, ApiProps, ICbBulkUpdatePayload, IUpsertPayload } from './api_interfaces';

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
    param?: string,
    query = ''
  ): Promise<Array<ICbSelect | string>> => {
    const route = param ? `${CbRoutes[cbRouteKey]}/${param}` : CbRoutes[cbRouteKey];
    const q = asSelect ? (query ? `${selectFormat}&${query}` : `${selectFormat}`) : `${query}`;
    const url = createUrl({ api: route, query: q });
    const { data } = await api.get(url);
    return data;
  };

  const verifyMarkingsAgainstTaxon = async (taxon_id: string, markings: IMarking[]) => {
    const url = createUrl({ api: `${CbRouters.markings}/verify` });
    const { data } = await api.post(url, { taxon_id: taxon_id, markings: markings });
    return data;
  };

  const upsertCritter = async (critter: IUpsertPayload<Critter>): Promise<Critter> => {
    const url = createUrl({ api: `${CbRouters.critters}/${critter.body.critter_id}${detailedFormat}` });
    const { data } = await api.patch(url, critter.body);
    return data;
  };

  const bulkUpdate = async (bulkPayload: ICbBulkUpdatePayload) => {
    const url = createUrl({ api: `${CbRouters.bulk}` });
    const { data } = await api.patch(url, bulkPayload);
    invalidate();
    return data;
  };

  const deleteMarking = async (marking_id: uuid): Promise<IMarking> => {
    const url = createUrl({ api: `${CbRouters.markings}/${marking_id}` });
    const { data } = await api.delete(url);
    return data;
  };

  const loginToCritterbase = async (
    system_user_id: string | undefined,
    keycloak_id: string | undefined
  ): Promise<Record<string, unknown>> => {
    try {
      const { data } = await api.post(`${CbRouters.login}`, {
        system_user_id: system_user_id,
        keycloak_uuid: keycloak_id,
        system_name: 'BCTW'
      });
      return data;
    } catch (e) {
      const { data } = await api.post(`${CbRouters.signup}`, {
        system_user_id: system_user_id,
        keycloak_uuid: keycloak_id,
        system_name: 'BCTW'
      });
      return data;
    }
  };

  return {
    getLookupTableOptions,
    upsertCritter,
    bulkUpdate,
    deleteMarking,
    verifyMarkingsAgainstTaxon,
    loginToCritterbase
  };
};
