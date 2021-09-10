import { getCritterEndpoint, upsertCritterEndpoint } from 'api/api_endpoint_urls';
import { createUrl } from 'api/api_helpers';
import { ApiProps, IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { plainToClass } from 'class-transformer';
import { Animal, AttachedAnimal, eCritterFetchType, IAnimal, IAttachedAnimal } from 'types/animal';

// fixme: type apis
// type APICall<T> = (...args: unknown[]) => T | T[];
// type API = Record<string, APICall<unknown>>;

export const critterApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const _handleGetResults = (
    data: IAnimal[] | IAttachedAnimal[],
    type: eCritterFetchType
  ): Animal[] | AttachedAnimal[] => {
    const results = data.map((json: IAnimal) =>
      type === eCritterFetchType.assigned ? plainToClass(AttachedAnimal, json) : plainToClass(Animal, json)
    );
    return type === eCritterFetchType.assigned ? results as AttachedAnimal[] : results as Animal[];
  };

  const getCritters = async (page = 1, critterType: eCritterFetchType): Promise<Animal[] | AttachedAnimal[]> => {
    const url = createUrl({ api: getCritterEndpoint, query: `critterType=${critterType}`, page, testUser });
    // console.log(`requesting assigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data, critterType);
  };

  const upsertCritter = async (payload: IUpsertPayload<Animal>): Promise<IBulkUploadResults<Animal>> => {
    const { body } = payload;
    const url = createUrl({ api: upsertCritterEndpoint, testUser });
    // const critters = body.map(a => serialize(a))
    const { data } = await api.post(url, body);
    return data;
  };

  const getCritterHistory = async (page: number, id: string): Promise<Animal[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`, page, testUser });
    const { data } = await api.get(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  };

  return {
    getCritters,
    getCritterHistory,
    upsertCritter,
  };
};
