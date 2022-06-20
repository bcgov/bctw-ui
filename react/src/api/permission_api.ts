import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { User } from 'types/user';
import { API, IBulkUploadResults, ApiProps } from 'api/api_interfaces';
import { eCritterPermission, filterOutNonePermissions, IExecutePermissionRequest, IPermissionRequest, IPermissionRequestInput, IUserCritterPermissionInput, PermissionRequest } from 'types/permission';
import { IUserCritterAccess, UserCritterAccess } from 'types/animal_access';
import { useQueryClient } from 'react-query';
import { ITableFilter } from 'components/table/table_interfaces';

// what the API returns after saving user/animal permissions
export interface IGrantCritterAccessResults {
  assignment_id: string;
  user_id: number;
  animal_id: string;
  valid_from: Date;
}

export const permissionApi = (props: ApiProps): API => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    queryClient.invalidateQueries('getRequestHistory');
  }

  const invalidateCritterAccess = (): void => {
    queryClient.invalidateQueries('critterAccess');
  }

  /**
   * used in the admin @function GrantCritterAccessPage
   * to grant user's access to animal's and the devices that they are attached to.
  */
  const grantCritterAccessToUser = async (
    body: IUserCritterPermissionInput
  ): Promise<IBulkUploadResults<IGrantCritterAccessResults>> => {
    const url = createUrl({ api: 'assign-critter-to-user' });
    const { data } = await api.post(url, [body]);
    const { results, errors } = data;
    invalidateCritterAccess();
    return { results, errors };
  };

  /**
   * @param user the @type {User} to retrieve the permissions for. 
   * @param filter an optional @type {eCritterPermission[]}, which is defaulted to 
   * all permission types other than 'none' - aka backend will not return critters that 
   * the user does not have any permission to.
  */
  const getUserCritterAccess = async (
    page: number,
    user: User,
    filter: eCritterPermission[] = filterOutNonePermissions,
  ): Promise<UserCritterAccess[]> => {
    if (!user?.username) {
      // eslint-disable-next-line no-console
      console.log(`unable to fetch user animal access, invalid user object ${JSON.stringify(user)}`);
      return [];
    }
    const filtersAsString = filter.join(',');
    const { username } = user;
    const url = createUrl({ api: `get-critter-access/${username}`, query: `filters=${filtersAsString}`, page });
    const { data } = await api.get(url);
    // may not be in an array if the user only has accesss to one animal
    const d: IUserCritterAccess[] = !Array.isArray(data) ? [data] : data;
    const converted: UserCritterAccess[] = d.map((json: IUserCritterAccess) => plainToClass(UserCritterAccess, json));
    return converted;
  };

  /**
   * admin only endpoint to display a list of active permission requests.
   * @returns {IPermissionRequest[]}, which queries from an view 
   * that splits the email list and individual @type {IUserCritterAccessInput} 
   * into multiple rows.
  */
  const getPermissionRequest = async (): Promise<PermissionRequest[]> => {
    const { data } = await api.get(createUrl({ api: `permission-request`}));
    const converted = data.map((d: IPermissionRequest) => plainToClass(PermissionRequest, d));
    return converted;
  }

  /**
   * an manager endpoint for viewing successful permission requests that were granted.
   * @returns {PermissionRequest[]}, which queries the API schemas user_animal_assignment_v view. 
   * Note: some fields will not be present ex. request_id 
  */
  const getPermissionHistory = async (page = 1): Promise<PermissionRequest[]> => {
    const { data } = await api.get(createUrl({ api: `permission-history`, page}));
    const converted = data.map((d: IPermissionRequest) => plainToClass(PermissionRequest, d));
    return converted;
  }

  /**
   * an endpoint for an manager to submit a permission request to grant one or more email addresses access
   * to a list of animals
  */
  const submitPermissionRequest = async (body: IPermissionRequestInput): Promise<IPermissionRequest> => {
    const url = createUrl({api: `submit-permission-request`});
    const { data } = await api.post(url, body);
    invalidate();
    return data;
  }

  /** 
   * an endpoint that an admin uses to grant or deny an manager's permission request
   * currently now edit functionality exists
  */
  const takeActionOnPermissionRequest = async (body: IExecutePermissionRequest): Promise<IUserCritterAccess> => {
    const url = createUrl({api: `execute-permission-request`});
    const { data } = await api.post(url, body);
    return data;
  }

  return {
    getUserCritterAccess,
    grantCritterAccessToUser,
    submitPermissionRequest,
    getPermissionRequest,
    getPermissionHistory,
    takeActionOnPermissionRequest
  };
};
