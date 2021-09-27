import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar, AttachedCollar, IAttachedCollar, eCollarAssignedStatus } from 'types/collar';
import { upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';

export const collarApi = (props: ApiProps) => {
  const { api } = props;

  const _handleGetResults = (
    data: IAttachedCollar[] | Collar[],
    type: eCollarAssignedStatus
  ): AttachedCollar[] | Collar[] => {
    const ret = data.map((json: ICollar | IAttachedCollar) => 
      plainToClass(type === eCollarAssignedStatus.Assigned ? AttachedCollar : Collar, json)
    );
    return type === eCollarAssignedStatus.Assigned ? ret as AttachedCollar[] : ret as Collar[];
  }

  const getAvailableCollars = async (page = 1): Promise<Collar[]> => {
    // console.log('get available collars')
    const { data } = await api.get(createUrl({ api: 'get-available-collars', page }));
    return _handleGetResults(data, eCollarAssignedStatus.Available);
  };

  const getAssignedCollars = async (page = 1): Promise<AttachedCollar[]> => {
    // console.log('get assigned collars')
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page }));
    return _handleGetResults(data, eCollarAssignedStatus.Assigned) as AttachedCollar[];
  };

  // a list of changes made to a collar, vs collar/critter attachment history above
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  };

  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { body } = payload;
    const url = createUrl({ api: upsertDeviceEndpoint });
    const { data } = await api.post(url, body);
    return data;
  };

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    upsertCollar
  };
};
