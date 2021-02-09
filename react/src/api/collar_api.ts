import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar } from 'types/collar';
import { ICollarHistory, CollarHistory } from 'types/collar_history';
import { ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';

export const collarApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const _handleGetResults = (data: ICollar[]): Collar[] => data.map((json: ICollar) => plainToClass(Collar, json));

  const getAvailableCollars = async (page = 1): Promise<Collar[]> => {
    // console.log('get available collars')
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page, testUser }));
    return _handleGetResults(data);
  };

  const getAssignedCollars = async (page = 1): Promise<ICollar[]> => {
    // console.log('get assigned collars')
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page, testUser}));
    return _handleGetResults(data);
  };

  const getCollarAssignmentHistory = async (critterId: number, page = 1): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `get-assignment-history/${critterId}`, page, testUser });
    // console.log(`requesting collar/critter assignment history`);
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    return results;
  };

  // a list of changes made to a collar, vs collar/critter attachment history above
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page, testUser });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  }

  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { isEdit, body } = payload;
    const url = createUrl({api: isEdit ? 'update-collar' : 'add-collar', testUser});
    const { data } = await api.post(url, body);
    return data;
  }

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    getCollarAssignmentHistory,
    upsertCollar,
  }
}