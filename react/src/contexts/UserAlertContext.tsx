import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { TelemetryAlert } from 'types/alert';

export interface IAlertContext {
  alerts: TelemetryAlert[];
  invalidate: () => void;
  error: string;
}
export const AlertContext = createContext<IAlertContext>({ alerts: [], invalidate: null, error: null});
export const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const [alertContext, setAlertContext] = useState<IAlertContext>(null);
  const queryClient = useQueryClient();

  const { data, status, error, dataUpdatedAt } = bctwApi.useAlert();

  useEffect(() => {
    // also watch dataUpdatedAt for query invalidations, otherwise
    // the context is not reset
    const update = (): void => {
      console.log('user alert status', status, data);
      if (status === 'success') {
        setAlertContext({ alerts: data, invalidate, error: null});
      } else if (status === 'error') {
        console.log(`error fetching user alerts ${error.toString()}`);
        setAlertContext({ alerts: [], invalidate, error: error.toString()})
      }
    };
    update();
  }, [status, dataUpdatedAt]);

  const invalidate = (): void => {
    // console.log('refetching user alerts');
    queryClient.invalidateQueries('userAlert');
  };

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