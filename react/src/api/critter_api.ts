import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal, IAnimal } from 'types/animal';
import { CollarHistory } from 'types/collar_history';

import { ICollarLinkPayload, IUpsertPayload } from './api_interfaces';

export const critterApi = (api: AxiosInstance) => {

  const _GET_CRITTER_API = 'get-animals';
  const _handleGetResults = (data: IAnimal[]): Animal[] => data.map((json: IAnimal) => plainToClass(Animal, json));

  const getAssignedCritters = async (page = 1): Promise<Animal[]> => {
    const url = createUrl({ api: _GET_CRITTER_API, query: 'assigned=true', page });
    // console.log(`requesting assigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data);
  }

  const getUnassignedCritters = async (page = 1): Promise<Animal[]> => {
    const url = createUrl({ api: _GET_CRITTER_API, query: 'assigned=false', page });
    // console.log(`requesting unassigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data);
  }

  const linkCollar = async (body: ICollarLinkPayload): Promise<CollarHistory> => {
    const url = createUrl({ api: 'change-animal-collar'});
    // console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data[0]);
  };

  const upsertCritter = async (payload: IUpsertPayload<Animal>): Promise<Animal[]> => {
    const { isEdit, body } = payload;
    const url = createUrl({ api: isEdit ? 'update-animal' : 'add-animal' });
    // const critters = body.map(a => serialize(a))
    const { data } = await api.post(url, body);
    const results = data.map((a: IAnimal) => plainToClass(Animal, a));
    return Array.isArray(results) && results.length > 1 ? results : results[0];
  }

  const getCritterHistory = async (id: string, page = 1): Promise<Animal[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`});
    const { data } = await api.get(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  }

  return {
    getAssignedCritters,
    getCritterHistory,
    getUnassignedCritters,
    linkCollar,
    upsertCritter,
  }
}