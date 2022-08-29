import { createUrl, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollar, Collar, AttachedCollar } from 'types/collar';
import { triggerTelemetryFetch, upsertDeviceEndpoint } from 'api/api_endpoint_urls';
import { API, ApiProps, IBulkUploadResults, IUpsertPayload } from './api_interfaces';
import { useQueryClient } from 'react-query';
import { FetchTelemetryInput, ResponseTelemetry } from 'types/events/vendor';
import { ITableFilter } from 'components/table/table_interfaces';

export const collarApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  const invalidate = (): void => {
    qc.invalidateQueries('collars_attached');
    qc.invalidateQueries('collars_unattached');
    qc.invalidateQueries('collarHistory');
    qc.invalidateQueries('getType');
  };

  /** fetches devices not attached to an animal  */
  const getAvailableCollars = async (page = 1, search?: ITableFilter[]): Promise<Collar[]> => {
    const url = createUrl({ api: `get-available-collars`, page, search });
    const { data } = await api.get(url);
    const ret = data.map((json: ICollar) => plainToClass(Collar, json));
    return ret;
  };

  /** fetches devices that are currently attached to an animal */
  const getAssignedCollars = async (page = 1, search?: ITableFilter[]): Promise<AttachedCollar[]> => {
    const url = createUrl({ api: 'get-assigned-collars', page, search });
    const { data } = await api.get(url);
    const ret = data.map((json: ICollar) => plainToClass(AttachedCollar, json));
    return ret;
  };

  /** fetches all devices, regardless of attachment status (from bctw.collar_v) */
  const getAllDevices = async (page = 1, search?: ITableFilter[]): Promise<Collar[]> => {
    const url = createUrl({ api: 'get-all-collars', page, search });
    const { data } = await api.get(url);
    const ret = data.map((json: ICollar) => plainToClass(Collar, json));
    return ret;
  };

  /** fetches all devices with devices that have no associated collar_id
   *  combines collar_v with unassigned_telemetry_v
   *  used in Telemetry Retrieval
   */
  const getAllDevicesWithUnassignedCollarIds = async (page = 1, search?: ITableFilter[]): Promise<Collar[]> => {
    const url = createUrl({ api: 'get-collars-and-deviceids', page, search });
    const { data } = await api.get(url);
    const ret = data.map((json: ICollar) => plainToClass(Collar, json));
    return ret;
  };

  // rerieve metadata changes made to a collar
  const getCollarHistory = async (collarId: string, page = 1): Promise<Collar[]> => {
    const url = createUrl({ api: `get-collar-history/${collarId}`, page });
    const { data } = await api.get(url);
    return data.map((json: ICollar[]) => plainToClass(Collar, json));
  };

  /** adds or updates a device */
  const upsertCollar = async (payload: IUpsertPayload<Collar>): Promise<IBulkUploadResults<Collar>> => {
    const { data } = await postJSON(api, createUrl({ api: upsertDeviceEndpoint }), payload.body);
    invalidate();
    return data;
  };

  /**
   * triggers a manual fetch of telemetry for the provided @param body.device_ids.
   */
  const triggerVendorTelemetryUpdate = async (body: FetchTelemetryInput[]): Promise<ResponseTelemetry> => {
    const { data } = await postJSON(api, createUrl({ api: triggerTelemetryFetch }), body);
    // eslint-disable-next-line no-console
    if (!data) {
      //console.log(`No JSON received from manual vendor trigger...`)
      return;
    }
    //console.log(`Success! JSON received from manual vendor trigger`, data);
    return data;
  };

  return {
    getAvailableCollars,
    getAssignedCollars,
    getAllDevicesWithUnassignedCollarIds,
    getCollarHistory,
    triggerVendorTelemetryUpdate,
    upsertCollar,
    getAllDevices
  };
};
