import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { TelemetryAlert } from 'types/alert';

export interface IAlertContext {
  alerts: TelemetryAlert[];
}
export const AlertContext = createContext<IAlertContext>({alerts: []});
export const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const bctwApi = useTelemetryApi();
  const [alertContext, setAlertContext] = useState<IAlertContext>(null);

  const { isFetching, isLoading, isError, data, status, error } = bctwApi.useAlert();

  useEffect(() => {
    const update = (): void => {
      if (status === 'success') {
        setAlertContext({alerts: data});
        console.log('alerts retrieved', data?.length)
      } else if (isError) {
        console.log('err retrieving alerts', error)
      } else if (isLoading || isFetching) {
        console.log('fetching user alerts');
      }
    };
    update();
  }, [status]);

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