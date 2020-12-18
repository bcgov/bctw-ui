import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';

import { IBulkUploadResults } from './api_interfaces';

export const bulkApi = (api: AxiosInstance) => {

  const uploadCsv = async <T,>(form: FormData): Promise<IBulkUploadResults<T>> => {
    const url = createUrl({ api: 'import' });
    const { data } = await api.post(url, form);
    return data;
  };
  return {
    uploadCsv,
  }
}