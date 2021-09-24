import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollarHistory, CollarHistory, AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { attachDeviceEndpoint, getCollarAssignmentHistoryEndpoint, removeDeviceEndpoint, updateDatalifeEndpoint } from 'api/api_endpoint_urls';
import { ApiProps } from 'api/api_interfaces';
import { ChangeDataLifeInput } from 'types/data_life';
import { useQueryClient } from 'react-query';

/**
 * api for animal/device relationship endpoints
 */

export const attachmentApi = (props: ApiProps) => {
  const { api } = props;
  const queryClient = useQueryClient();

  // todo: test
  const invalidateQueries = (): void => {
    queryClient.invalidateQueries('collarAssignmentHistory');
  }

  /** given a critter_id, retrieve it's device attachment history */
  const getCollarAssignmentHistory = async (critterId: number, page = 1): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `${getCollarAssignmentHistoryEndpoint}/${critterId}`, page });
    // console.log(`requesting collar/critter assignment history`);
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    // console.log(results);
    return results;
  };

  const attachDevice = async (body: AttachDeviceInput): Promise<CollarHistory> => {
    const url = createUrl({ api: attachDeviceEndpoint});
    // console.log(`posting ${url}: ${JSON.stringify(body)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data);
  }

  const removeDevice = async (body: RemoveDeviceInput): Promise<CollarHistory> => {
    const url = createUrl({ api: removeDeviceEndpoint});
    // console.log(`posting ${url}: ${JSON.stringify(body)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data);
  }

  const updateAttachmentDataLife = async (body: ChangeDataLifeInput): Promise<CollarHistory> => {
    const url = createUrl({ api: updateDatalifeEndpoint});
    // console.log(`posting ${url}: ${JSON.stringify(body)}`);
    const { data } = await api.post(url, body);
    invalidateQueries();
    return plainToClass(CollarHistory, data);
  }

  return {
    getCollarAssignmentHistory,
    attachDevice,
    removeDevice,
    updateAttachmentDataLife,
  };
};
