import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';
import { exportEndpoint, importCSVEndpoint, importXMLEndpoint } from './api_endpoint_urls';

import { IBulkUploadResults } from './api_interfaces';

export const bulkApi = (api: AxiosInstance) => {

  const uploadCsv = async <T,>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: importCSVEndpoint});
    const { data } = await api.post(url, form);
    return data;
  };

  /** uploads one or more xml files to be parsed as Vectronic .keyx */
  const uploadFiles = async(form: FormData): Promise<IBulkUploadResults<unknown>> => {
    const url = createUrl({api: importXMLEndpoint});
    const { data } = await api.post(url, form);
    return data;
  }

  const getType = async <T extends BCTWBase, >(type: BCTWType, id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}`});
    const { data } = await api.get(url);
    return data.map(json => type === 'animal' ? plainToClass(Animal, json) : plainToClass(Collar, json))[0];
  }

  const getExportData = async (body: ExportQueryParams): Promise<string[]> => {
    const url = createUrl({ api: exportEndpoint})
    const { data } = await api.post(url, body);
    const results = data.flat();
    return results;
  }

  return {
    getExportData,
    getType,
    uploadCsv,
    uploadFiles,
  }
}