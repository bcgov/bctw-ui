import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { Animal, IAnimal } from 'types/animal';
import { User, UserRole } from 'types/user';
import { IGrantCritterAccessParams, IGrantCritterAccessResults } from './api_interfaces';


export const userApi = (api: AxiosInstance) => {

  const getUserRole = async(): Promise<UserRole> => {
    const url = createUrl({ api: 'get-user-role' });
    const { data } = await api.get(url);
    return data;
  }

  const getUser = async(): Promise<User> => {
    const url = createUrl({ api: 'get-user' });
    const { data } = await api.get(url);
    const user = plainToClass(User, data);
    return user;
  }

  const getUsers = async(): Promise<any> => {
    // todo:
    const url = createUrl({ api: 'get-users' });
  }

  const grantCritterAccessToUser = async(props: IGrantCritterAccessParams): Promise<IGrantCritterAccessResults[]> => {
    const url = createUrl({ api: 'assign-critter-to-user'})
    const { data } = await api.post(url, props);
    return data;
  }

  const getUserCritterAccess = async(idir: string): Promise<Animal[]> => {
    const url = createUrl({api: `get-critter-access/${idir}`});
    const { data } = await api.post(url);
    return data.map((json: IAnimal[]) => plainToClass(Animal, json));
  }

  return {
    getUserCritterAccess,
    grantCritterAccessToUser,
    getUserRole,
    getUser,
    // getUsers,
  }
}