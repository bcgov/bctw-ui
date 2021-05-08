import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { TelemetryAlert } from 'types/alert';

export interface IAlertContext {
  alerts: TelemetryAlert[];
  refetch: () => void;
}
export const AlertContext = createContext<IAlertContext>({alerts: [], refetch: null});
export const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const [alertContext, setAlertContext] = useState<IAlertContext>(null);
  const queryClient = useQueryClient();

  const { isFetching, isLoading, isError, data, status, error } = bctwApi.useAlert();

  useEffect(() => {
    const update = (): void => {
      if (status === 'success') {
        setAlertContext({alerts: data ,refetch});
        console.log('alerts retrieved', data?.length)
      } else if (isError) {
        console.log('err retrieving alerts', error)
      } 
      // else if (isLoading || isFetching) {
      //   console.log('fetching user alerts');
      // }
    };
    update();
  }, [status]);

  const refetch = ():void => {
    console.log('refetching user alerts');
    queryClient.invalidateQueries('userAlert');
  }

  return (
    <AlertContext.Provider value={alertContext}>
      <AlertContextDispatch.Provider value={setAlertContext}>{props.children}</AlertContextDispatch.Provider>
    </AlertContext.Provider>
  );
};

const useAlertContextDispatch = (): React.Context<IAlertContext> => {
  const context = useContext(AlertContextDispatch);
  return context;
};
export { useAlertContextDispatch };