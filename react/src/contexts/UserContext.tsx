import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect } from 'react';
import { User } from 'types/user';

export interface IUserContext {
  ready?: boolean;
  user: User;
}
export const UserContext = createContext<IUserContext>({
  ready: false,
  user: null
});

export const UserStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const [userContext, setUserContext] = useState<IUserContext>({ready: false, user: null});

  const { isFetching, isLoading, isError, data, status } = (bctwApi.useUser as any)();

  useEffect(() => {
    const update = (): void => {
      if (status === 'success') {
        const user = data;
        setUserContext({ready: true, user});
      } else if (isLoading || isFetching || isError) {
        setUserContext({ready: false, user: null});
      }
    };
    update();
  }, [status]);

  return <UserContext.Provider value={userContext}>{props.children}</UserContext.Provider>;
};
