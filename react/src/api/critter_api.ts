import { getCritterEndpoint, upsertCritterEndpoint } from 'api/api_endpoint_urls';
import { createUrl, postJSON } from 'api/api_helpers';
import { API, ApiProps, IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { plainToClass } from 'class-transformer';
import { Animal, AttachedAnimal, eCritterFetchType, IAnimal, IAttachedAnimal } from 'types/animal';
import { useQueryClient } from 'react-query';
import { ITableFilter } from 'components/table/table_interfaces';

export const critterApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('critters_assigned');
    qc.invalidateQueries('critters_unassigned');
    qc.invalidateQueries('getType');
    qc.invalidateQueries('pings');
  };

  const _handleGetResults = (
    data: IAnimal[] | IAttachedAnimal[],
    type: eCritterFetchType
  ): Animal[] | AttachedAnimal[] => {
    const results = data.map((json: IAnimal) =>
      type === eCritterFetchType.assigned ? plainToClass(AttachedAnimal, json) : plainToClass(Animal, json)
    );
    return type === eCritterFetchType.assigned ? (results as AttachedAnimal[]) : (results as Animal[]);
  };

  const getCritters = async (
    page = 1,
    critterType: eCritterFetchType,
    search?: ITableFilter
  ): Promise<Animal[] | AttachedAnimal[]> => {
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
    upsertCritter
  };
};
