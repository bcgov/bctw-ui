import { createUrl, isDev, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ITelemetryAlert, MortalityAlert, TelemetryAlert } from 'types/alert';
import { eUDFType, IUDF, IUDFInput } from 'types/udf';
import { eUserRole, IKeyCloakSessionInfo, IUser, User } from 'types/user';
import { upsertAlertEndpoint } from 'api/api_endpoint_urls';
import { ApiProps } from 'api/api_interfaces';
import { useQueryClient } from 'react-query';


export const userApi = (props: ApiProps) => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    queryClient.invalidateQueries('all_users');
  }

  /**
   * retrieves keycloak session data
   * note: in dev this will likely 404
   * @file {layouts/DefaultLayout.tsx} will only show
   * the error/404 screen if the user info is not able to be retrieved
   */
  const getSessionInfo = async (): Promise<IKeyCloakSessionInfo> => {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.error('keycloak session info not retrievable in dev, UserContext.session object will be invalid');
      return null;
    }
    const url = createUrl({ api: 'session-info' });
    const { data } = await api.get(url);
    // console.log('retrieve session info', data);
    return data;
  };

  /**
   * @param user a new or existing @type {User}
   * defaults role_type to the user's property or 'observer' if that isn't defined
   * note: user object returned will not have role_type
   */
  const addUser = async (user: User): Promise<User> => {
    // console.log('posting user', user)
    const role = user.role_type ?? eUserRole.observer;
    const { data } = await postJSON(api, createUrl({ api: 'add-user' }), {user, role});
    const ret = plainToClass(User, data);
    console.log('user upsert result:', ret);
    invalidate();
    return ret;
  };

  /**
   * used in the user context to retrieve the user info
   */
  const getUser = async (): Promise<User> => {
    const url = createUrl({ api: 'get-user' });
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
    const url = createUrl({ api: 'get-users' });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  /**
   * @returns {TelemetryAlert[]} that the user has access to (through their critters)
   */
  const getUserAlerts = async (): Promise<MortalityAlert[]> => {
    const url = createUrl({ api: 'get-user-alerts' });
    const { data } = await api.get(url);
    const alerts = data?.map((json) => plainToClass(MortalityAlert, json));
    return alerts;
  };

  /**
   * @param body @type {TelemetryAlert}
   * @returns
   */
  const updateAlert = async (body: TelemetryAlert[]): Promise<TelemetryAlert[]> => {
    const { data } = await postJSON(api, createUrl({ api: upsertAlertEndpoint }), body) ;
    if (data && data.length) {
      const converted = data?.map((json: ITelemetryAlert) => plainToClass(TelemetryAlert, json));
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
   * replaces the user's existing UDFs with @param {IUDF[]}
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
    getSessionInfo,
  };
};
