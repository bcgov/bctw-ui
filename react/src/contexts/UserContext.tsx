import { AxiosError } from 'axios';
import { plainToClass } from 'class-transformer';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { UseQueryOptions } from 'react-query/types/react';
import { User, IKeyCloakSessionInfo } from 'types/user';

export interface IUserContext {
  user: User | null;
  session: IKeyCloakSessionInfo | null;
  error: AxiosError | null;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  session: null,
  error: null
});

export const UserContextDispatch = createContext(null);

/**
 * provided in @file {App.tsx}
 * user information is retrieved from two endpoints:
    * a) user table in the database @function getUser which includes the BCTW specific user role (ex. admin)
    * b) the proxy server endpoint that retrieves keycloak session info @function getSessionInfo

  * if the user table's row is outdated, ie keycloak has newer info, update it 
 */
export const UserStateContextProvider: React.FC = (props) => {
  const api = useTelemetryApi();
  // instantiate the context
  const [userContext, setUserContext] = useState<IUserContext>({ user: null, session: null, error: null });
  const [session, setSession] = useState<IKeyCloakSessionInfo>();

  // when fetching the user, only retry once in order to redirect invalid users to the onboarding pages 'faster'
  const fetchUserOptions: Pick<UseQueryOptions, 'retry'> = { retry: 1 };
  // fetch the BCTW user specific data
  const { isError: isUserError, data: userData, status: userStatus, error: userError } = api.useUser(fetchUserOptions);
  // fetch the keycloak session data
  const {
    isError: isSessionError,
    data: sessionData,
    status: sessionStatus,
    error: sessionError
  } = api.useUserSessionInfo();
  // setup the mutation, used if the user row in the database is out of date
  const onSuccess = (v: User): void => {
    console.log('UserContext: new user object is', v);
  };
  const onError = (e): void => {
    console.log('UserContext: error saving user', e);
  };
  const { mutateAsync } = api.useSaveUser({ onSuccess, onError });

  // when the user data is fetched...
  useEffect(() => {
    if (userStatus === 'success') {
      setUserContext((o) => ({ ...o, user: userData }));
    }
  }, [userStatus]);

  // when the session data is fetched
  useEffect(() => {
    if (sessionStatus === 'success') {
      setSession(sessionData);
      setUserContext((o) => ({ ...o, session: sessionData }));
    }
  }, [sessionStatus]);

  /**
   * if both are fetched successfully, check if the user object in the database should be updated
   * to reflect changes in the keycloak object
   */
  useDidMountEffect(() => {
    const { error, session, user } = userContext;
    if (session && user && !error) {
      handleUserChanged();
    }
  }, [userContext]);

  // when there was an error fetching the user
  useEffect(() => {
    if (userError) {
      const n = { user: null, error: userError };
      setUserContext((o) => ({ ...o, ...n }));
    }
  }, [isUserError]);

  // when there was an error fetching the keycloak session
  useEffect(() => {
    if (sessionError) {
      const n = { session: null, error: sessionError };
      setUserContext((o) => ({ ...o, ...n }));
    }
  }, [isSessionError]);

  /**
   * keycloak session may be different/newer than the database record.
   * when the context loads the user:
   * check the fields are the same
   * if there are any differences, upsert them
   */
  const handleUserChanged = async (): Promise<void> => {
    const { user } = userContext;
    if (!user) {
      return;
    }
    if (
      session.username === user.username &&
      session.email === user.email &&
      session.family_name === user.lastname &&
      session.given_name === user.firstname &&
      session.keycloak_guid === user.keycloak_guid
    ) {
      // no updates required
      return;
    }
    // update entry in bctw.user table
    const updated = plainToClass(User, user);
    const { email, given_name, family_name, domain, username, keycloak_guid } = session;
    updated.email = email;
    updated.firstname = given_name;
    updated.lastname = family_name;
    updated.username = username;
    updated.keycloak_guid = keycloak_guid;
    if (domain === 'bceid') {
      updated.bceid = username;
      delete updated.idir;
    } else if (domain === 'idir') {
      updated.idir = username;
      delete updated.bceid;
    }
    console.log(`keycloak session object has new info, upserting new user ${JSON.stringify(updated)}`);
    await mutateAsync(updated);
  };

  return (
    <UserContext.Provider value={userContext}>
      <UserContextDispatch.Provider value={setUserContext}>{props.children}</UserContextDispatch.Provider>
    </UserContext.Provider>
  );
};

const useUserContextDispatch = () => {
  const context = useContext(UserContextDispatch);
  return context;
};

export { useUserContextDispatch };
