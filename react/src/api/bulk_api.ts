import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTW, TypeWithData } from 'types/common_types';
import { exportQueryParams } from 'types/export';

import { IBulkUploadResults } from './api_interfaces';

export const bulkApi = (api: AxiosInstance) => {

  const uploadCsv = async <T,>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: 'import-csv' });
    const { data } = await api.post(url, form);
    return data;
  };

  const uploadFiles = async(form: FormData): Promise<IBulkUploadResults<any>> => {
    // todo: add multi-file support to server.js
    const url = createUrl({api: 'import-xml'});
    const { data } = await api.post(url, form);
    return data;
  }

  const getType = async <T extends BCTW, >(type: TypeWithData, id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}`});
    const { data } = await api.get(url);
    return data.map(json => type === 'critter' ? plainToClass(Animal, json) : plainToClass(Collar, json))[0];
  }

  const getExportData = async (body: exportQueryParams): Promise<string[]> => {
    const url = createUrl({ api: `export`})
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