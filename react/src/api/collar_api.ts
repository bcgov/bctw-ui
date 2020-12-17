import { AxiosInstance } from 'axios';
import { createUrl } from 'api/api_helpers';
import { ICollarResults } from 'api/api_interfaces';
import { plainToClass } from 'class-transformer';
import { ICollar } from 'types/collar';
import { ICollarHistory, CollarHistory } from 'types/collar_history';

export const collarApi = (api: AxiosInstance) => {

  const getAvailableCollars = async (key: string, page = 1): Promise<ICollar[]> => {
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page }));
    return data;
  };

  const getAssignedCollars = async (key: string, page = 1): Promise<ICollar[]> => {
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page }));
    return data;
  };

  const getCollars = async (key: string, page = 1): Promise<ICollarResults> => {
    const results = await Promise.all([getAssignedCollars('', page), getAvailableCollars('', page)]);
    return {
      assigned: results[0],
      available: results[1]
    };
  };

  const getCollarHistory = async (key: string, critterId: number): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `get-assignment-history/${critterId}` });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    return results;
  };

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollars,
    getCollarHistory,
  }
}