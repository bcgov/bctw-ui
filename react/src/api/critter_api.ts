import { getCritterEndpoint, upsertCritterEndpoint } from 'api/api_endpoint_urls';
import { createUrl, postJSON } from 'api/api_helpers';
import { ApiProps, IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { plainToClass } from 'class-transformer';
import { Animal, AttachedAnimal, eCritterFetchType, IAnimal, IAttachedAnimal } from 'types/animal';
import { useQueryClient } from 'react-query';

export const critterApi = (props: ApiProps) => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    queryClient.invalidateQueries('critters_assigned');
    queryClient.invalidateQueries('critters_unassigned');
    queryClient.invalidateQueries('getType');
    queryClient.invalidateQueries('pings');
  }

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
    const url = createUrl({ api: getCritterEndpoint, query: `critterType=${critterType}`, page });
    // console.log(`requesting assigned critters page: ${page}`);
    const { data } = await api.get(url);
    return _handleGetResults(data, critterType);
  };

  const upsertCritter = async (payload: IUpsertPayload<Animal>): Promise<IBulkUploadResults<Animal>> => {
    const { data } = await postJSON(api, createUrl({ api: upsertCritterEndpoint }), payload.body);
    invalidate();
    return data;
  };

  const getCritterHistory = async (page: number, id: string): Promise<Animal[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`, page });
    const { data } = await api.get(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  };

  return {
    getCritters,
    getCritterHistory,
    upsertCritter,
  };
};
