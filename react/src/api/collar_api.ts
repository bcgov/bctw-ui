import { createUrl, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar, AttachedCollar } from 'types/collar';
import { triggerTelemetryFetch, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { API, ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';
import { useQueryClient } from 'react-query';
import { DeviceMake, FetchTelemetryInput } from 'types/events/vendor';
import { Search } from 'components/table/table_interfaces';

export const collarApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('collars_attached');
    qc.invalidateQueries('collars_unattached');
    qc.invalidateQueries('collarHistory');
    qc.invalidateQueries('getType');
  };

  const getAvailableCollars = async (page = 1, search?: Search): Promise<Collar[]> => {
    const url = createUrl({
      api: `get-available-collars`,
      query: search ? `keys=${search.keys}&term=${search.term}` : '',
      page
    });
    const { data } = await api.get(url);
    const ret = data.map((json: ICollar) => plainToClass(Collar, json));
    return ret;
  };

  const getAssignedCollars = async (page = 1): Promise<AttachedCollar[]> => {
    const { data } = await api.get(createUrl({ api: 'get-assigned-collars', page }));
    const ret = data.map((json: ICollar) => plainToClass(AttachedCollar, json));
    return ret;
  };

  // a list of changes made to a collar, vs collar/critter attachment history above
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page });
    // console.log(`requesting collar history`);
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  };

  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { data } = await postJSON(api, createUrl({ api: upsertDeviceEndpoint }), payload.body);
    invalidate();
    return data;
  };

  /**
   * triggers a manual fetch of telemetry for the provided @param body.device_ids.
   * todo: provide type
   */
  const triggerVendorTelemetryUpdate = async (body: FetchTelemetryInput, type: DeviceMake): Promise<void> => {
    const { data } = await postJSON(api, createUrl({ api: triggerTelemetryFetch }), body);
    return data;
  };

  return {
    getAvailableCollars,
    getAssignedCollars,
    getCollarHistory,
    triggerVendorTelemetryUpdate,
    upsertCollar
  };
};
