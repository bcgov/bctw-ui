import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTW } from 'types/common_types';

import { IBulkUploadResults } from './api_interfaces';

export const bulkApi = (api: AxiosInstance) => {

  const uploadCsv = async <T,>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: 'import' });
    const { data } = await api.post(url, form);
    return data;
  };

  const getType = async <T extends BCTW, >(type: 'critter' | 'collar', id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}`});
    const { data } = await api.get(url);
    return data.map(json => type === 'critter' ? plainToClass(Animal, json) : plainToClass(Collar, json))[0];
  }

  return {
    getType,
    uploadCsv,
  }

}