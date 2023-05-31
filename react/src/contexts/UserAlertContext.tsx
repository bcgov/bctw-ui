import { ENABLE_ALERTS } from 'api/api_helpers';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, useEffect, useState } from 'react';
import { Alert, TelemetryAlert } from 'types/alert';

/**
 * Context that children components can listen to.
 * Provides:
 *  a) an array of @type {T extends TelemetryAlert} applicable to the user
 *  b) a method to invalidate the query (force refetch alerts) when an alert is updated
 *
 * fixme: hooks with generic type??
 */

interface IAlertContext<T extends TelemetryAlert> {
  alerts: T[];
  getAlertTitle: () => string;
  error: string;
}
export const AlertContext = createContext<IAlertContext<Alert>>({
  alerts: [],
  getAlertTitle: (): string => 'Alerts(0)',
  error: null
});
const AlertContextDispatch = createContext(null);

export const AlertStateContextProvider: React.FC = (props) => {
  const api = useTelemetryApi();
  //const useUser = useContext(UserContext);

  const [alertContext, setAlertContext] = useState<IAlertContext<Alert> | null>(null);
  //const [shouldFetchAlerts, setShouldFetchAlerts] = useState(false);

  const { data, status, error, dataUpdatedAt } = api.useAlert({
    enabled: ENABLE_ALERTS
  });

  // until the user is loaded, don't bother fetching alerts
  // useEffect(() => {
  //   // console.log('should fetch alerts', !!useUser?.user);
  //   //Issue in get_user_telemetry_alerts query returning more than one result...
  //   ENABLE_ALERTS && setShouldFetchAlerts(!!useUser?.user);
  // }, [useUser]);

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
