import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { TelemetryAlert } from 'types/alert';
import { UserContext } from 'contexts/UserContext';

/**
 * Context that children components can listen to.
 * Provides:
 *  a) an array of @type {T extends TelemetryAlert} applicable to the user
 *  b) a method to invalidate the query (force refetch alerts) when an alert is updated
 *
 * fixme: hooks with generic type??
 */

export interface IAlertContext<T extends TelemetryAlert> {
  alerts: T[];
  getAlertTitle: () => string;
  error: string;
}
export const AlertContext = createContext<IAlertContext<any>>({
  alerts: [],
  getAlertTitle: (): string => 'Alerts(0)',
  error: null
});
export const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const api = useTelemetryApi();
  const useUser = useContext(UserContext);

  const [alertContext, setAlertContext] = useState<IAlertContext<any> | null>(null);
  const [shouldFetchAlerts, setShouldFetchAlerts] = useState(false);

  const { data, status, error, dataUpdatedAt } = api.useAlert({ enabled: shouldFetchAlerts });

  // until the user is loaded, don't bother fetching alerts
  useEffect(() => {
    // console.log('should fetch alerts', !!useUser?.user);
    //Uncomment this line to enable user alerts again
    //Issue in get_user_telemetry_alerts query returning more than one result...
    //setShouldFetchAlerts(!!useUser?.user);
  }, [useUser]);

  /**
   * also watching @var dataUpdatedAt for query invalidations
   * otherwise the context is not reset when alerts are updated
   */
  useEffect(() => {
    const update = (): void => {
      // console.log('user alert status', status, data);
      if (status === 'success') {
        setAlertContext({ alerts: data, getAlertTitle, error: null });
      } else if (status === 'error') {
        console.error(`error fetching user alerts ${error.toString()}`);
        setAlertContext({ alerts: [], getAlertTitle, error: error.toString() });
      }
    };
    update();
  }, [status, dataUpdatedAt]);

  const getAlertTitle = (): string => {
    if (!data?.length) {
      return 'Alerts(0)';
    }
    const numSnoozed = data.filter((a) => a.isSnoozed).length;
    const numEditors = data.filter((a) => a.isEditor).length;
    const snoozedStr = numSnoozed ? `Snoozed (${numSnoozed})` : '';
    const actionAlerts = data.length - numSnoozed - numEditors;

    return `Alerts that require action (${actionAlerts < 0 ? 0 : actionAlerts}) ${snoozedStr}`;
  };

  return (
    <AlertContext.Provider value={alertContext}>
      <AlertContextDispatch.Provider value={setAlertContext}>{props.children}</AlertContextDispatch.Provider>
    </AlertContext.Provider>
  );
};

const useAlertContextDispatch = (): React.Context<IAlertContext<any>> => {
  const context = useContext(AlertContextDispatch);
  return context;
};
export { useAlertContextDispatch };
