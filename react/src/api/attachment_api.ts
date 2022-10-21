import { createUrl, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollarHistory, CollarHistory, AttachDeviceInput, RemoveDeviceInput } from 'types/collar_history';
import { attachDeviceEndpoint, getCollarAssignmentHistoryEndpoint, removeDeviceEndpoint, updateDatalifeEndpoint } from 'api/api_endpoint_urls';
import { API, ApiProps } from 'api/api_interfaces';
import { ChangeDataLifeInput } from 'types/data_life';
import { useQueryClient } from 'react-query';

/**
 * api for animal/device attachment or relationship endpoints
 */

export const attachmentApi = (props: ApiProps): API => {
  const { api } = props;
  const qc = useQueryClient();

  /**
   * forces refetch/invalidation of queries
   * called after various attachemnt api endpoints return a response
   */
  const invalidateDeviceAssignmentHistory = (): void => {
    qc.invalidateQueries('collarAssignmentHistory');
    qc.invalidateQueries('critters_unassigned');
    qc.invalidateQueries('critters_assigned');
    qc.invalidateQueries('getType');
  }

  /** given a critter_id, retrieve it's device attachment history */
  const getCollarAssignmentHistory = async (critterId: number, page = 1): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `${getCollarAssignmentHistoryEndpoint}/${critterId}`, page });
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    return results;
  };

  /** attach an animal to a device */
  const attachDevice = async (body: AttachDeviceInput): Promise<CollarHistory> => {
    const { data } = await postJSON(api, createUrl({ api: attachDeviceEndpoint}), body);
    invalidateDeviceAssignmentHistory()
    return plainToClass(CollarHistory, data);
  }

  /** remove a device from an animal */
  const removeDevice = async (body: RemoveDeviceInput): Promise<CollarHistory> => {
    const { data } = await postJSON(api, createUrl({ api: removeDeviceEndpoint}), body);
    invalidateDeviceAssignmentHistory()
    return plainToClass(CollarHistory, data);
  }

  /** change the data life start or end of an existing animal/device attachment */
  const updateAttachmentDataLife = async (body: ChangeDataLifeInput): Promise<CollarHistory> => {
    const { data } = await postJSON(api, createUrl({ api: updateDatalifeEndpoint}), body);
    invalidateDeviceAssignmentHistory();
    return plainToClass(CollarHistory, data);
  }

  return {
    getCollarAssignmentHistory,
    attachDevice,
    removeDevice,
    updateAttachmentDataLife,
  };
};
