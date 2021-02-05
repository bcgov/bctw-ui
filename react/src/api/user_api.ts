import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { IUser, IUserCritterAccess, User, UserCritterAccess } from 'types/user';
import { IUserCritterPermissionInput, IGrantCritterAccessResults, IBulkUploadResults } from './api_interfaces';

export const userApi = (api: AxiosInstance) => {
  // const getUserRole = async (): Promise<UserRole> => {
  //   const url = createUrl({ api: 'get-user-role' });
  //   const { data } = await api.get(url);
  //   return data;
  // };

  const getUser = async (): Promise<User> => {
    const url = createUrl({ api: 'get-user' });
    // console.log('fetching user info');
    const { data } = await api.get(url);
    const user = plainToClass(User, data);
    return user;
  };

  const getUsers = async (page: number): Promise<User[]> => {
    const url = createUrl({ api: 'get-users' });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  const grantCritterAccessToUser = async (body: IUserCritterPermissionInput): Promise<IBulkUploadResults<IGrantCritterAccessResults>> => {
    const url = createUrl({ api: 'assign-critter-to-user' });
    const { data } = await api.post(url, body);
    const { results, errors } = data;
    return { results, errors };
  };

  const getUserCritterAccess = async (page, idir: string): Promise<UserCritterAccess[]> => {
    const url = createUrl({ api: `get-critter-access/${idir}`, page });
    // console.log(`retrieving critter access: ${url}`);
    const { data } = await api.get(url);
    return data.map((json: IUserCritterAccess[]) => plainToClass(UserCritterAccess, json));
  };

  return {
    getUserCritterAccess,
    grantCritterAccessToUser,
    getUser,
    getUsers
  };
};
