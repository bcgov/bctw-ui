import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { Animal, eCritterFetchType, IAnimal } from 'types/animal';
import { upsertCritterEndpoint } from 'api/api_endpoint_urls';

import { ApiProps, IBulkUploadResults, IDeleteType, IUpsertPayload } from './api_interfaces';

export const critterApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const _GET_CRITTER_API = 'get-animals';
  const _handleGetResults = (data: IAnimal[]): Animal[] => {
    const results = data.map((json: IAnimal) => plainToClass(Animal, json));
    return results;
  }

  const getCritters = async (page = 1, critterType: eCritterFetchType): Promise<Animal[]> => {
    const url = createUrl({ api: _GET_CRITTER_API, query: `critterType=${critterType}`, page, testUser });
    // console.log(`requesting assigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data);
  }

  const upsertCritter = async (payload: IUpsertPayload<Animal>): Promise<IBulkUploadResults<Animal>> => {
    const { body } = payload;
    const url = createUrl({ api: upsertCritterEndpoint, testUser });
    // const critters = body.map(a => serialize(a))
    const { data } = await api.post(url, body);
    return data;
  }

  // also handles deletes for collars
  const deleteType = async ({objType, id}: IDeleteType): Promise<boolean> => {
    const url = createUrl({ api: `${objType}/${id}` });
    const { status, data } = await api.delete(url);
    if (status === 200) {
      return true;
    }
    return data;
  }

  const getCritterHistory = async (page: number, id: string): Promise<Animal[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`, page, testUser});
    const { data } = await api.get(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  }

  return {
    deleteType,
    getCritters,
    getCritterHistory,
    upsertCritter,
  }
}