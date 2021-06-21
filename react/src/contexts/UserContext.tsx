import { AxiosError } from 'axios';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { User } from 'types/user';

export interface IUserContext {
  ready?: boolean;
  user: User;
  testUser?: string;
  error?: AxiosError;
}
export const UserContext = createContext<IUserContext>({
  ready: false,
  user: null,
  error: null
});
export const UserContextDispatch = createContext(null);

export const UserStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const [userContext, setUserContext] = useState<IUserContext>({ ready: false, user: null});

  const { isFetching, isLoading, isError, data, status, error } = bctwApi.useUser();

  useEffect(() => {
    const update = (): void => {
      if (status === 'success') {
        const user = data;
        // console.log('user context: ', user)
        setUserContext({ ready: true, user });
      } else if (isLoading || isFetching) {
        setUserContext({ ready: false, user: null });
      } else if (isError) {
        setUserContext({ ready: false, user: null, error });
      }
    };
    update();
  }, [status]);

  useEffect(() => {
    // console.log('test user changed', JSON.stringify(userContext.testUser));
    queryClient.invalidateQueries();
  }, [userContext.testUser]);

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
