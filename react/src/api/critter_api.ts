import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal, IAnimal } from 'types/animal';
import { CollarHistory } from 'types/collar_history';

import { ICollarLinkPayload, ICritterResults } from './api_interfaces';

export const critterApi = (api: AxiosInstance) => {

  const getCritters = async (key: string, page = 1): Promise<ICritterResults> => {
    const apiStr = 'get-animals';
    const urlAssigned = createUrl({ api: apiStr, query: 'assigned=true', page });
    const urlAvailable = createUrl({ api: apiStr, query: 'assigned=false', page });
    console.log(`requesting critters ${urlAssigned}`);
    const results = await Promise.all([api.get(urlAssigned), api.get(urlAvailable)]);
    return {
      assigned: results[0].data?.map((json: IAnimal) => plainToClass(Animal, json)),
      available: results[1].data?.map((json: IAnimal) => plainToClass(Animal, json))
    }
  };

  const linkCollar = async (body: ICollarLinkPayload): Promise<CollarHistory> => {
    const link = body.isLink ? 'link-animal-collar' : 'unlink-animal-collar';
    const url = createUrl({ api: link });
    console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
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
    getCritters,
    linkCollar,
    upsertCritter,
  }
}