import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { BCTWType } from 'types/common_types';
import { ExportQueryParams } from 'types/export';
import { exportEndpoint, importCSVEndpoint, importXMLEndpoint } from './api_endpoint_urls';
import { useQueryClient } from 'react-query';
import { API, IBulkUploadResults, IDeleteType } from './api_interfaces';

export const bulkApi = (api: AxiosInstance): API => {
  const queryClient = useQueryClient();

  const invalidateCritters = (): void => {
    queryClient.invalidateQueries('critters_assigned');
    queryClient.invalidateQueries('critters_unassigned');
  }

  const invalidateDevices = (): void => {
    queryClient.invalidateQueries('collartype');
    queryClient.invalidateQueries('getType');
  }

  const invalidateUsers = (): void => {
    queryClient.invalidateQueries('all_users');
  }

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

  /**
   * @param type 'animal' or 'device'
   * @param id BCTW internal uuid
   * @returns the raw data returned from the api, does not call the transformer
   */
  const getType = async <T>(type: BCTWType, id: string): Promise<T> => {
    const url = createUrl({ api: `${type}/${id}`});
    const { data } = await api.get(url);
    return data;
  }

  // handles critter/collar/user deletions
  const deleteType = async ({ objType, id }: IDeleteType): Promise<boolean> => {
    const url = createUrl({ api: `${objType}/${id}` });
    const { status, data } = await api.delete(url);
    switch(objType) {
      case 'animal':
        invalidateCritters();
        break;
      case 'collar':
        invalidateDevices();
        break;
      case 'user':
        invalidateUsers();
    }
    if (status === 200) {
      return true;
    }
    return data;
  };

  const getExportData = async (body: ExportQueryParams): Promise<string[]> => {
    const url = createUrl({ api: exportEndpoint})
    const { data } = await api.post(url, body);
    const results = data.flat();
    return results;
  }

  return {
    deleteType,
    getExportData,
    getType,
    uploadCsv,
    uploadFiles,
  }
}