import { useState, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext';
import { AlertContext } from 'contexts/UserAlertContext';
import UserAlert from 'pages/user/UserAlertPage';
import { Modal } from 'components/common';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require the user to exist
 * assuming the user exists, also forces open the alerts modal 
 * if there are alerts that require action
 */
export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const userChanges = useContext(UserContext);
  const useAlert = useContext(AlertContext);
  const [err, setErr] = useState<string>(null);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);

  useEffect(() => {
    const updateComponent = (): void => {
      const { error } = userChanges;
      if (error) {
        setErr(error);
      }
    };
    updateComponent();
  }, [userChanges]);

  useEffect(() => {
    if (useAlert?.alerts?.length) {
      const isCriticalToUpdate = useAlert.alerts.some((a) => !a.isSnoozed && a.snoozesAvailable === 0);
      if (isCriticalToUpdate) {
        // eslint-disable-next-line no-console
        console.log('at least one alert is critical, force open alert dialog');
        setShowAlerts(true);
      } else {
        // eslint-disable-next-line no-console
        console.log('no alerts in crital state, hide alert dialog');
        setShowAlerts(false);
      }
    }
  }, [useAlert]);

  // user info could not be retrieved from API
  if (err && !userChanges.user) {
    return <div>ERROR {err}</div>;
  }
  // pass these props to the modal to 'force' the user to perform the alert action
  const disableCloseModalProps = {
    disableBackdropClick: true,
    disableEscapeKeyDown: true
  };
  return (
    <>
      <Modal title={`Alerts (${useAlert?.alerts?.length})`} open={showAlerts} handleClose={(): void => setShowAlerts(false)} {...disableCloseModalProps}>
        <UserAlert />
      </Modal>
      {children}
    </>
  );
}
