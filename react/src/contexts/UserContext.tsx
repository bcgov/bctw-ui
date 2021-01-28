import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, useContext } from 'react';
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

  const { isFetching, isLoading, isError, error, data } = (bctwApi.useUser as any)();

  if (data) {
    context.user = data;
    context.ready = true;
  }

  return <UserContext.Provider value={context}>{props.children}</UserContext.Provider>;
};
