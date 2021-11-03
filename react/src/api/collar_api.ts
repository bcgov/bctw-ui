import { createUrl, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar, AttachedCollar } from 'types/collar';
import { upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { API, ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';
import { useQueryClient } from 'react-query';

export const collarApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('collars_attached');
    qc.invalidateQueries('collars_unattached');
    qc.invalidateQueries('collarHistory');
    qc.invalidateQueries('getType');
  }

  const getAvailableCollars = async (page = 1): Promise<Collar[]> => {
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page }));
    const ret = data.map((json: ICollar) => plainToClass(Collar, json));
    return ret;
  };

  const getAssignedCollars = async (page = 1): Promise<AttachedCollar[]> => {
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page }));
    const ret = data.map((json: ICollar) => plainToClass(AttachedCollar, json));
    return ret;
  };

  // a list of changes made to a collar, vs collar/critter attachment history above
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  };

  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { data } = await postJSON(api, createUrl({ api: upsertDeviceEndpoint }), payload.body);
    invalidate();
    return data;
  };

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    upsertCollar
  };
};
