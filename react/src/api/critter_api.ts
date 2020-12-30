import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal, IAnimal } from 'types/animal';
import { CollarHistory } from 'types/collar_history';

import { ICollarLinkPayload } from './api_interfaces';

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
    const link = body.isLink ? 'link-animal-collar' : 'unlink-animal-collar';
    const url = createUrl({ api: link });
    // console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data[0]);
  };

  const upsertCritter = async (body: Animal[]): Promise<Animal[]> => {
    const url = createUrl({ api: 'add-animal' });
    // const critters = body.map(a => serialize(a))
    const { data } = await api.post(url, body);
    return data.map((a: IAnimal) => plainToClass(Animal, a));
  }

  return {
    getAssignedCritters,
    getUnassignedCritters,
    linkCollar,
    upsertCritter,
  }
}