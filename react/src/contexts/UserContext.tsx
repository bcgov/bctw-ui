import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, useContext, useEffect } from 'react';
import { User } from 'types/user';

export interface IUserState {
  ready?: boolean;
  user: User;
}
export const UserContext = createContext<IUserState>({
  ready: false,
  user: null
});

export const UserStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const context = useContext(UserContext);

  const { isFetching, isLoading, isError, data, status } = (bctwApi.useUser as any)();

  useEffect(() => {
    const update = (): void => {
      if (data) {
        context.user = data;
        context.ready = true;
      } else if (isLoading || isFetching || isError) {
        context.ready = false;
      }
    };
    update();
  }, [status]);

  return <UserContext.Provider value={context}>{props.children}</UserContext.Provider>;
};
