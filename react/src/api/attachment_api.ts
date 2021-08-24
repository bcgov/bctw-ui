import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ICollarHistory, CollarHistory, ICollarLinkPayload } from 'types/collar_history';
import { linkCollarEndpoint } from 'api/api_endpoint_urls';
import { ApiProps } from 'api/api_interfaces';

/**
 * api for animal/device relationship endpoints
 */

export const attachmentApi = (props: ApiProps) => {
  const { api } = props;

  /** given a critter_id, retrieve it's device attachment history */
  const getCollarAssignmentHistory = async (critterId: number, page = 1): Promise<CollarHistory[]> => {
    const url = createUrl({ api: `get-assignment-history/${critterId}`, page });
    // console.log(`requesting collar/critter assignment history`);
    const { data } = await api.get(url);
    const results = data.map((json: ICollarHistory) => plainToClass(CollarHistory, json));
    return results;
  };

  /** 
   * attach or remove a device from an animal 
   * todo: fixme: support provided valid_from / valid_to inputs
   */
  const linkCollar = async (body: ICollarLinkPayload): Promise<CollarHistory> => {
    const url = createUrl({ api: linkCollarEndpoint });
    // console.log(`posting ${link}: ${JSON.stringify(body.data)}`);
    const { data } = await api.post(url, body);
    return plainToClass(CollarHistory, data[0]);
  };

  return {
    getCollarAssignmentHistory,
    linkCollar,
  };
};
