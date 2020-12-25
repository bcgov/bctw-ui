import { AxiosInstance } from 'axios';
import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar } from 'types/collar';
import { ICollarHistory, CollarHistory } from 'types/collar_history';

export const collarApi = (api: AxiosInstance) => {

  const _handleGetResults = (data: ICollar[]): Collar[] => data.map((json: ICollar) => plainToClass(Collar, json));

  const getAvailableCollars = async (key: string, page = 1): Promise<Collar[]> => {
    // console.log('get available collars')
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page }));
    return _handleGetResults(data);
  };

  const getAssignedCollars = async (key: string, page = 1): Promise<ICollar[]> => {
    // console.log('get assigned collars')
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page }));
    return _handleGetResults(data);
  };

  const getCollarHistory = async (key: string, critterId: number, page = 1): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `get-assignment-history/${critterId}`, page });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    return results;
  };

  const upsertCollar = async (body: Collar[]): Promise<Collar[]> => {
    const url = createUrl({api: 'add-collar'});
    const { data } = await api.post(url, body);
    return data.map((c: ICollar) => plainToClass(Collar, c));
  }

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    upsertCollar,
  }
}