import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { User, IKeyCloakSessionInfo } from 'types/user';

export interface IUserContext {
  user?: User;
  session?: IKeyCloakSessionInfo;
  error?: string;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  session: null,
  error: null,
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
    if (userStatus === 'success') {
      setReadyUser(true);
      setUserContext({ user: userData });
    } else {
      setReadyUser(false);
    } 
  }, [userStatus]);

  // when the session data is fetched
  useEffect(() => {
    if (sessionStatus === 'success') {
      setReadySession(true);
      setSession(sessionData);
      setUserContext({ session: sessionData });
    }
  }, [sessionStatus]);

  useDidMountEffect(() => {
    // if both are ready, check if the user object needs to be updated
    if (readySession && readyUser) {
      handleUserChanged();
    }
  }, [readySession, readyUser])

  // when there was an error retrieving data
  useEffect(() => {
    if (sessionError || userError) {
      const err = isUserError ? userError : isSessionError ? sessionError : null;
      const error = err?.response?.data?.error;
      console.log('UserContext: failed to retrieve user or session info', error);
      const user = isUserError ? null : userContext.user;
      setUserContext({ user, error })
    }
  }, [sessionError, userError])

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
    const newUser = Object.assign({}, user);

    // create new user in user table with role 'newUser' using Keycloak information
    newUser.email = session.email;
    newUser.firstname = session.given_name;
    newUser.lastname = session.family_name;
    console.log(`keycloak session object has new info, upserting new user ${JSON.stringify(newUser)}`);
    await mutateAsync(newUser);
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