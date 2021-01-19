import { createUrl } from 'api/api_helpers';
import { AxiosInstance } from 'axios';
import { UserRole, IUser } from 'types/user';


export const userApi = (api: AxiosInstance) => {

  const requestUserRole = async(): Promise<UserRole> => {
    const url = createUrl({ api: 'role' });
    const { data } = await api.get(url);
    return data;
  }

  const getUsers = async(): Promise<any> => {
    // todo:
    const url = createUrl({ api: 'role' });
  }

  const grantCritterAccessToUser = async(idir: string, animalId: number | number[]): Promise<any> => {
    const url = createUrl({ api: 'assign-critter-to-user'})
    const { data } = await api.post(url, { idir, animalId });
    return data;
  }

  return {
    grantCritterAccessToUser,
    requestUserRole,
  }
}