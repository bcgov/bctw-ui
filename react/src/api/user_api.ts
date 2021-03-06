import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { TelemetryAlert } from 'types/alert';
import { ITelemetryDetail } from 'types/map';
import { eCritterPermission, IUser, IUserCritterAccess, User, UserCritterAccess } from 'types/user';
import {
  IUserCritterPermissionInput,
  IGrantCritterAccessResults,
  IBulkUploadResults,
  ApiProps
} from './api_interfaces';

export const userApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const addUser = async (body: User): Promise<User> => {
    const url = createUrl({ api: 'add-user'});
    const { data } = await api.post(url, body);
    const user = plainToClass(User, data);
    return user;
  }

  const getUser = async (): Promise<User> => {
    const url = createUrl({ api: 'get-user', testUser });
    // console.log('fetching user info');
    const { data } = await api.get(url);
    const user = plainToClass(User, data);
    return user;
  };

  const getUsers = async (page: number): Promise<User[]> => {
    const url = createUrl({ api: 'get-users', testUser });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  const grantCritterAccessToUser = async (
    body: IUserCritterPermissionInput
  ): Promise<IBulkUploadResults<IGrantCritterAccessResults>> => {
    const url = createUrl({ api: 'assign-critter-to-user', testUser });
    const { data } = await api.post(url, body);
    const { results, errors } = data;
    return { results, errors };
  };

  const getUserCritterAccess = async (
    page: number,
    user: string,
    filterOutNone = false
  ): Promise<UserCritterAccess[]> => {
    const url = createUrl({ api: `get-critter-access/${user}`, page });
    // console.log(`retrieving critter access: ${url}`);
    const { data } = await api.get(url);
    const converted = data.map((json: IUserCritterAccess[]) => plainToClass(UserCritterAccess, json));
    return filterOutNone ? converted.filter((d) => d.permission_type !== eCritterPermission.none) : converted;
  };

  const getUserAlerts = async (
  ): Promise<TelemetryAlert[]> => {
    const url = createUrl({api: 'get-user-alerts'});
    const { data } = await api.get(url);
    const converted = data.map((json: ITelemetryDetail[]) => plainToClass(TelemetryAlert, json));
    return converted;
  }

  return {
    addUser,
    getUserCritterAccess,
    grantCritterAccessToUser,
    getUser,
    getUsers,
    getUserAlerts,
  };
};
