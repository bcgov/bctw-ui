import { getAttachedHistoricEndpoint, getCritterEndpoint, upsertCritterEndpoint } from 'api/api_endpoint_urls';
import { createUrl, postJSON } from 'api/api_helpers';
import { API, ApiProps, IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { plainToClass } from 'class-transformer';
import { ITableFilter } from 'components/table/table_interfaces';
import { useQueryClient } from 'react-query';
import { AttachedCritter, Critter, Critters, eCritterFetchType } from 'types/animal';
import { createFlattenedProxy } from 'types/common_types';

export const critterApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('critters_assigned');
    qc.invalidateQueries('critters_unassigned');
    qc.invalidateQueries('getType');
    qc.invalidateQueries('pings');
  };

  /**
   * converts json to the class instance of the animals
   */
  const _handleGetResults = (data: Critters[], type: eCritterFetchType): Critters[] => {
    const results = data.map((json: AttachedCritter) =>
      type === eCritterFetchType.assigned
        ? plainToClass(AttachedCritter, json)
        : createFlattenedProxy(plainToClass(Critter, json))
    );
    return type === eCritterFetchType.assigned ? (results as AttachedCritter[]) : (results as Critter[]);
  };

  /**
   * fetches animals, based on @param critterType
   */
  const getCritters = async (
    page = 1,
    critterType: eCritterFetchType,
    search?: ITableFilter[]
  ): Promise<Critters[]> => {
    const url = createUrl({ api: getCritterEndpoint, query: `critterType=${critterType}`, page, search });
    const { data } = await api.get(url);
    return _handleGetResults(data, critterType);
  };

  /**
   * create or edit an animal
   */
  const upsertCritter = async (payload: IUpsertPayload<Critter>): Promise<IBulkUploadResults<Critter>> => {
    const { data } = await postJSON(api, createUrl({ api: upsertCritterEndpoint }), payload.body);
    invalidate();
    return data;
  };

  /**
   * retrieve the metadata history of an animal, given a @param id (critter_id)
   */
  const getCritterHistory = async (page: number, id: string): Promise<Critter[]> => {
    const url = createUrl({ api: `get-animal-history/${id}`, page });
    const { data } = await api.get(url);
    return data.map((json: Critter[]) => plainToClass(Critter, json));
  };

  const getAssignedCrittersHistoric = async (): Promise<AttachedCritter[]> => {
    const url = createUrl({ api: getAttachedHistoricEndpoint });
    const { data } = await api.get(url);
    return data;
  };

  return {
    getCritters,
    getCritterHistory,
    upsertCritter,
    getAssignedCrittersHistoric
  };
};
