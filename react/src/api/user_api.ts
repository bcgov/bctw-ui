import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { TelemetryAlert } from 'types/alert';
import { eUDFType, IUDF, IUDFInput } from 'types/udf';
import { eUserRole, IKeyCloakSessionInfo, IUser, User } from 'types/user';
import { upsertAlertEndpoint } from 'api/api_endpoint_urls';
import { ApiProps } from 'api/api_interfaces';

export interface IUserUpsertPayload {
  user: User;
  role: eUserRole;
}

export const userApi = (props: ApiProps) => {
  const { api, testUser } = props;

  /**
   * retrieves keycloak session data
   * note: in dev this will likely 404
   * @file {layouts/DefaultLayout.tsx} will only show
   * the error/404 screen if the user info is not able to be retrieved
   */
  const getSessionInfo = async (): Promise<IKeyCloakSessionInfo> => {
    const url = createUrl({ api: 'session-info' });
    const { data } = await api.get(url);
    console.log('retrieve session info', data);
    return data;
  };

  /**
   * @param body a new or existing @type {User}
   */
  const addUser = async (body: IUserUpsertPayload): Promise<User> => {
    const url = createUrl({ api: 'add-user' });
    const { data } = await api.post(url, body);
    const user = plainToClass(User, data);
    return user;
  };

  /**
   * used in the user context to retrieve the user info
   */
  const getUser = async (): Promise<User> => {
    const url = createUrl({ api: 'get-user', testUser });
    const { data } = await api.get(url);
    const user = plainToClass(User, data);
    // console.log('fetched user info', user);
    return user;
  };

  /**
   * used in admin user access page to display a list of users in the system
   * @param page unused, but since this endpoint is used in a data table,
   * this param is provided by default
   * @returns {User[]} including their user role
   */
  const getUsers = async (page: number): Promise<User[]> => {
    const url = createUrl({ api: 'get-users', testUser });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  /**
   * @returns {TelemetryAlert[]} that the user has access to (through their critters)
   */
  const getUserAlerts = async (): Promise<TelemetryAlert[]> => {
    const url = createUrl({ api: 'get-user-alerts' });
    const { data } = await api.get(url);
    // console.log('user alerts fetched', data);
    if (data && Array.isArray(data)) {
      const converted = data?.map((json) => plainToClass(TelemetryAlert, json));
      return converted;
    }
    return [];
  };

  /**
   * @param body @type {TelemetryAlert}
   * @returns
   */
  const updateAlert = async (body: TelemetryAlert[]): Promise<TelemetryAlert[]> => {
    const url = createUrl({ api: upsertAlertEndpoint });
    const { data } = await api.post(url, body);
    if (data && data.length) {
      const converted = data?.map((json) => plainToClass(TelemetryAlert, json));
      return converted;
    }
    return [];
  };

  /**
   * @param udf_type (currently only one udf type defined, critter_group
   * @returns {IUDF[]} that are stored per user
   */
  const getUDF = async (udf_type: eUDFType): Promise<IUDF[]> => {
    const url = createUrl({ api: 'get-udf', query: `type=${udf_type}` });
    const { data } = await api.get(url);
    return data;
  };

  /**
   * currently replaces the user's existing UDFs with @param {IUDF[]}
   * @returns
   */
  const upsertUDF = async (udfs: IUDFInput[]): Promise<IUDF[]> => {
    const url = createUrl({ api: 'add-udf' });
    const { data } = await api.post(url, udfs);
    return data;
  };

  return {
    addUser,
    getUDF,
    getUser,
    getUsers,
    getUserAlerts,
    upsertUDF,
    updateAlert,
    getSessionInfo
  };
};
