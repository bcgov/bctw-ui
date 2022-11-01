import { createUrl, isDev, postJSON } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { BatteryAlert, eAlertType, ITelemetryAlert, MalfunctionAlert, MortalityAlert, TelemetryAlert } from 'types/alert';
import { eUDFType, IUDF, UDF } from 'types/udf';
import { eUserRole, IKeyCloakSessionInfo, IUser, User } from 'types/user';
import { upsertAlertEndpoint } from 'api/api_endpoint_urls';
import { API, ApiProps } from 'api/api_interfaces';
import { useQueryClient } from 'react-query';

/** api for handling:
 * user object updates
 * session info
 * retrieving/ updating telemetry alerts
 * retrieving/ updating udfs (custom animal groups and animal collective units)
 */
export const userApi = (props: ApiProps): API => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidateUsers = (): void => {
    queryClient.invalidateQueries('all_users');
  };

  const invalidateAlerts = (): void => {
    // console.log('refetching user alerts');
    queryClient.invalidateQueries('userAlert');
  };

  const invalidateUDF = (): void => {
    queryClient.invalidateQueries('getUDF');
  };

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
    //console.log('retrieve session info', data);
    return data;
  };

  /**
   * @param user a new or existing @type {User}
   * defaults role_type to the user's property or 'user' if that isn't defined
   * note: returned user object will not have role_type
   */
  const addUser = async (user: User): Promise<User> => {
    // console.log('posting user', user)
    const role = user.role_type ?? eUserRole.user;
    const { data } = await postJSON(api, createUrl({ api: 'add-user' }), { user, role });
    const ret = plainToClass(User, data);
    // console.log('user upsert result:', ret);
    invalidateUsers();
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
  const getUsers = async (): Promise<User[]> => {
    const url = createUrl({ api: 'get-users' });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  /**
   * @returns {TelemetryAlert[]} that the user has access to (through their critters)
   */
  const getUserAlerts = async <T extends TelemetryAlert>(): Promise<T[]> => {
    const url = createUrl({ api: 'get-user-alerts' });
    const { data } = await api.get(url);
    const alerts = data?.map((json: ITelemetryAlert) => {
      switch (json.alert_type) {
        case eAlertType.mortality:
          return plainToClass(MortalityAlert, json);
        case eAlertType.malfunction:
          return plainToClass(MalfunctionAlert, json);
        case eAlertType.battery:
          return plainToClass(BatteryAlert, json);
        default:
          return plainToClass(TelemetryAlert, json);
      }
    });
    return alerts;
  };

  /**
   * @param body @type {TelemetryAlert}
   */
  const updateAlert = async (body: TelemetryAlert[]): Promise<TelemetryAlert[]> => {
    const { data } = await postJSON(api, createUrl({ api: upsertAlertEndpoint }), body);
    invalidateAlerts();
    if (data && data.length) {
      const converted = data?.map((json: ITelemetryAlert) => plainToClass(TelemetryAlert, json));
      return converted;
    }
    return [];
  };

  /**
   *  sends a test SMS and email notification
   * user must have email address associated
   * simulating a mortality alert (with fake data)
   * @param email users email address
   * @param phone users phone number
   * @returns nothing, errors are only logged to the api console
   */
  const testUserAlertNotifications = async (body: { email: string; phone: string }): Promise<void> => {
    const { email, phone } = body;
    await api.get(createUrl({ api: 'test-alert-notif', query: `email=${email}&phone=${phone}` }));
  };

  /**
   * @param udf_type (currently only one udf type defined, critter_group
   * @returns {IUDF[]} that are stored per user
   */
  const getUDF = async (udf_type: eUDFType): Promise<UDF[]> => {
    const url = createUrl({ api: 'get-udf', query: `type=${udf_type}` });
    const { data } = await api.get(url);
    const converted = data?.map((json) => plainToClass(UDF, json));
    return converted;
  };

  /**
   * replaces the user's existing UDFs with @param {IUDF[]}
   * todo: use new post handler
   */
  const upsertUDF = async (udfs: IUDF[]): Promise<IUDF[]> => {
    const url = createUrl({ api: 'add-udf' });
    const { data } = await api.post(url, udfs);
    invalidateUDF();
    return data;
  };

  return {
    addUser,
    getUDF,
    getUser,
    getUsers,
    getUserAlerts,
    testUserAlertNotifications,
    upsertUDF,
    updateAlert,
    getSessionInfo
  };
};
