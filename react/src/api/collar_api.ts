import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar } from 'types/collar';
import { upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';

export const collarApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const _handleGetResults = (data: ICollar[]): Collar[] => data.map((json: ICollar) => plainToClass(Collar, json));

  const getAvailableCollars = async (page = 1): Promise<Collar[]> => {
    // console.log('get available collars')
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page, testUser }));
    return _handleGetResults(data);
  };

  const getAssignedCollars = async (page = 1): Promise<Collar[]> => {
    // console.log('get assigned collars')
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page, testUser}));
    return _handleGetResults(data);
  };

  // a list of changes made to a collar, vs collar/critter attachment history above
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page, testUser });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  }

  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { body } = payload;
    const url = createUrl({api: upsertDeviceEndpoint, testUser});
    const { data } = await api.post(url, body);
    return data;
  }

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    upsertCollar,
  }
}