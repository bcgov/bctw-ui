import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';
import {
  exportEndpoint,
  exportAllEndpoint,
  importCSVEndpoint,
  importXMLEndpoint,
  importXLSXEndpoint,
  importFinalizeEndpoint
} from './api_endpoint_urls';
import { useQueryClient } from 'react-query';
import { API, IBulkUploadResults, IDeleteType, ParsedXLSXSheetResult, XLSXPayload } from './api_interfaces';
import { DeviceWithVectronicKeyX, VectronicKeyX } from 'types/collar';

export const bulkApi = (api: AxiosInstance): API => {
  const qc = useQueryClient();

  const invalidateCritters = (): void => {
    qc.invalidateQueries('critters_assigned');
    qc.invalidateQueries('critters_unassigned');
    qc.invalidateQueries('getType');
  };

  const invalidateDevices = (): void => {
    qc.invalidateQueries('collars_attached');
    qc.invalidateQueries('collars_unattached');
    qc.invalidateQueries('getType');
  };

  /** uploads a single .csv file in to upsert animals/collars */
  const uploadCsv = async <T>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: importCSVEndpoint });
    const { data } = await api.post(url, form);
    invalidateDevices();
    invalidateCritters();
    return data;
  };

  const finalizeXlsx = async <T>(body: XLSXPayload): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: importFinalizeEndpoint });
    const { data } = await api.post(url, body);
    invalidateDevices();
    invalidateCritters();
    return data;
  };

  const uploadXlsx = async (form: FormData): Promise<ParsedXLSXSheetResult> => {
    const url = createUrl({ api: importXLSXEndpoint });
    const { data } = await api.post(url, form);
    return data;
  };

  /** uploads one or more xml files to be parsed as Vectronic .keyx */
  const uploadFiles = async (form: FormData): Promise<IBulkUploadResults<VectronicKeyX>> => {
    const url = createUrl({ api: importXMLEndpoint });
    const { data } = await api.post(url, form);
    return data;
  };

  /**
   * fetch a single device/animal
   * @param type 'animal' or 'device'
   * @param id the collar_id / critter_id
   * @returns the raw data returned from the api, does not call the transformer
   */
  const getType = async <T>(type: BCTWType, id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}` });
    const { data } = await api.get(url);
    return data.length ? data[0] : data;
  };

  /**
   * removes / soft deletes a critter/collar/user
   */
  const deleteType = async ({ objType, id }: IDeleteType): Promise<boolean> => {
    const url = createUrl({ api: `${objType}/${id}` });
    const { status, data } = await api.delete(url);
    if (status === 200) {
      return true;
    }
    return data;
  };

  /**
   *
   */
  const getExportData = async (body: ExportQueryParams): Promise<string[]> => {
    const url = createUrl({ api: exportEndpoint });
    const { data } = await api.post(url, body);
    const results = data.flat();
    return results;
  };

  const getAllExportData = async (body: unknown): Promise<string[]> => {
    const url = createUrl({ api: exportAllEndpoint });
    const { data } = await api.post(url, body);
    const results = data.flat();
    return results;
  };

  const getTemplateFile = async (file_key: string): Promise<any> => {
    const body = `file_key=${file_key}`;
    const url = createUrl({ api: 'get-template', query: body });
    const { data } = await api.get(url);
    const results = data;
    return results;
  };

  const getKeyX = async (device_ids?: number[]): Promise<DeviceWithVectronicKeyX[]> => {
    const body = `device_ids=${device_ids}`;
    const url = createUrl({ api: 'get-collars-keyx', query: device_ids && body });
    const { data } = await api.get(url);
    const results = data;
    return results;
  };

  return {
    deleteType,
    getExportData,
    getAllExportData,
    getType,
    uploadCsv,
    uploadXlsx,
    finalizeXlsx,
    uploadFiles,
    getTemplateFile,
    getKeyX
  };
};
