import { NotificationBanner } from 'components/alerts/Banner';
import { FormatAlert } from 'components/alerts/FormatAlert';
import { AlertContext } from 'contexts/UserAlertContext';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { TelemetryAlert } from 'types/alert';
/**
 * Displays an an alert banner, used in CritterPage
 * Only displays valid alerts / non-snoozed alerts
 */
export const AlertBanner = (): JSX.Element => {
  const useAlert = useContext(AlertContext);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  useEffect(() => {
    if (useAlert?.alerts?.length) {
      //Set only the valid (null valid_to) alerts where snoozed_to date < today
      const nonSnoozedValidAlerts = useAlert.alerts.filter(
        (a) => !a.valid_to.isValid() && !(dayjs(a.snoozed_to).diff(dayjs()) > 0)
      );
      setAlerts(nonSnoozedValidAlerts);
    }
  }, [useAlert]);
  return (
    <NotificationBanner
      hiddenContent={alerts.map((alert) => (
        <FormatAlert alert={alert} format='banner' />
      ))}
    />
  );
};
