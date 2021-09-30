import { AxiosError } from 'axios';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { User, IKeyCloakSessionInfo } from 'types/user';

export interface IUserContext {
  user   : User | null;
  session: IKeyCloakSessionInfo | null;
  error  : AxiosError | null;
}

export const UserContext = createContext<IUserContext>({
  user   : null,
  session: null,
  error  : null,
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
  const [readyUser, setReadyUser] = useState(false);
  const [readySession, setReadySession] = useState(false);

  // fetch the BCTW user specific data
  const { isError: isUserError, data: userData, status: userStatus, error: userError } = api.useUser();
  // fetch the keycloak session data
  const { isError: isSessionError, data: sessionData, status: sessionStatus, error: sessionError } = api.useUserSessionInfo();
  // setup the mutation, used if the user row in the database is out of date
  const onSuccess = (v: User): void => {
    console.log('UserContext: new user object is', v);
  }
  const onError = (e): void => {
    console.log('UserContext: error saving user', e)
  }
  const { mutateAsync } = api.useSaveUser({onSuccess, onError });

  // when the user data is fetched...
  useEffect(() => {
    // console.log('user fetching status', userStatus)
    if (userStatus === 'success') {
      setReadyUser(true);
      setUserContext(o => ({...o, user: userData }));
    } else {
      setReadyUser(false);
    } 
  }, [userStatus]);

  // when the session data is fetched
  useEffect(() => {
    if (sessionStatus === 'success') {
      setReadySession(true);
      setSession(sessionData);
      setUserContext(o => ({ ...o, session: sessionData }));
    }
  }, [sessionStatus]);

  useDidMountEffect(() => {
    // if both are ready, check if the user object needs to be updated
    if (readySession && readyUser) {
      handleUserChanged();
    }
  }, [readySession, readyUser])

  // when there was an error fetching the user
  useEffect(() => {
    if (userError) {
      console.log('UserContext: failed to fetch user', userError);
      const n = { user: null, error: userError }
      setUserContext(o => ({...o, ...n}))
    }
  }, [isUserError])

  // when there was an error fetching the keycloak session
  useEffect(() => {
    if (sessionError) {
      console.log('UserContext: failed to retrieve session', sessionError);
      const n = { session: null, error: sessionError};
      setUserContext(o => ({...o, ...n}))
    }
  }, [isSessionError])

  /**
   * keycloak session may be different/newer than what is persisted in the database.
   * when the context loads the user, check the fields are the same, if there are differences,
   * upsert them
   * fixme: should idir/bceid be updated?
   */
  const handleUserChanged = async (): Promise<void> => {
    const { user } = userContext;
    // confirm valid state 
    if (!session || !user) {
      console.log('UserContext: handleUserChanged: session or user info not ready')
      return;
    }
    if (session.email === user.email && session.family_name === user.lastname && session.given_name === user.firstname) {
      console.log('UserContext: handleUserchanged: keycloak info matches database record');
      // console.log('UserContext: handleUserchanged: keycloak info matches database record', user, session);
      // no updates required
      return;
    }
    const updatedUser = Object.assign({}, user);

    // create new user in user table with role 'newUser' using Keycloak information
    updatedUser.email = session.email;
    updatedUser.firstname = session.given_name;
    updatedUser.lastname = session.family_name;
    console.log(`keycloak session object has new info, upserting new user ${JSON.stringify(updatedUser)}`);
    await mutateAsync(updatedUser);
  }

  return (
    <UserContext.Provider value={userContext}>
      <UserContextDispatch.Provider value={setUserContext}>{props.children}</UserContextDispatch.Provider>
    </UserContext.Provider>
  );
};

const useUserContextDispatch = () => {
  const context = useContext(UserContextDispatch);
  return context;
}

export { useUserContextDispatch }