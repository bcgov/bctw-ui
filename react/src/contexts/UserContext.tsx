import { AxiosError } from 'axios';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { User, IKeyCloakSessionInfo } from 'types/user';

export interface IUserContext {
  session: IKeyCloakSessionInfo;
  user: User;
  error?: AxiosError;
  ready?: boolean;
}

export const UserContext = createContext<IUserContext>({
  session: null,
  user: null,
  error: null,
  ready: false
});

export const UserContextDispatch = createContext(null);

/**
 * provided in App.tsx, this context is available across the application.
 * user information is retrieved from two endpoints:
    * a) user table in the database (useUser) endpoint, which stores the BCTW specific role (ex. admin)
    * b) the proxy server endpoint that retrieves keycloak session info (useUserSessinInfo)
 */
export const UserStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  // instantiatethe context
  const [userContext, setUserContext] = useState<IUserContext>({ ready: false, user: null, session: null});

  // fetch the BCTW user specific data
  const { isError: isUserError, data: userData, status: userStatus, error: userError } = bctwApi.useUser();
  // fetch the keycloak session data
  const { isError: isSessionError, data: sessionData, status: sessionStatus, error: sessionError } = bctwApi.useUserSessionInfo();

  // when the user data is fetched...
  useEffect(() => {
    if (userStatus === 'success') {
      setUserContext({ ready: true, user: userData, session: userContext.session });
    } 
  }, [userStatus]);

  // when the session data is fetched
  useEffect(() => {
    if (sessionStatus === 'success') {
      setUserContext({ ready: userContext.ready, session: sessionData, user: userContext.user });
    }
  }, [sessionStatus]);

  // when there was an error retrieving data
  useEffect(() => {
    if (sessionError || userError) {
      const err = isUserError ? userError : isSessionError ? sessionError : null;
      const error = err?.response?.data?.error;
      console.log('failed to retrieve user or session info', error);
      const user = isUserError ? null : userContext.user;
      const session = isSessionError ? null: userContext.session;
      setUserContext({ ready: false, error, session, user })
    }
  }, [sessionError, userError])

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
