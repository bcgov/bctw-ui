import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { Animal, IAnimal } from 'types/animal';
import { CollarHistory } from 'types/collar_history';

import { ApiProps, eCritterFetchType, ICollarLinkPayload, IUpsertPayload } from './api_interfaces';

export const critterApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const _GET_CRITTER_API = 'get-animals';
  const _handleGetResults = (data: IAnimal[]): Animal[] => data.map((json: IAnimal) => plainToClass(Animal, json));

  const getCritters = async (page = 1, critterType: eCritterFetchType): Promise<Animal[]> => {
    const url = createUrl({ api: _GET_CRITTER_API, query: `critterType=${critterType}`, page, testUser });
    // console.log(`requesting assigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data);
  }

  const linkCollar = async (body: ICollarLinkPayload): Promise<CollarHistory> => {
    const url = createUrl({ api: 'change-animal-collar', testUser});
    // console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data[0]);
  };

  const upsertCritter = async (payload: IUpsertPayload<Animal>): Promise<Animal[]> => {
    const { isEdit, body } = payload;
    const url = createUrl({ api: isEdit ? 'update-animal' : 'add-animal', testUser });
    // const critters = body.map(a => serialize(a))
    const { data } = await api.post(url, body);
    const results = data.map((a: IAnimal) => plainToClass(Animal, a));
    return Array.isArray(results) && results.length > 1 ? results : results[0];
  }

  const getCritterHistory = async (id: string, page = 1): Promise<Animal[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`, page, testUser});
    const { data } = await api.get(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  }

  return {
    getCritters,
    getCritterHistory,
    linkCollar,
    upsertCritter,
  }
}