import { useState, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext';
import { AlertContext } from 'contexts/UserAlertContext';
import UserAlert from 'pages/user/UserAlertPage';
import { Modal } from 'components/common';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import UserOnboarding from 'pages/onboarding/UserOnboarding';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require the user to exist
 * assuming the user exists, also forces open the alerts modal 
 * if there are alerts that require action
 */
export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);
  const [err, setErr] = useState<AxiosError | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const updateComponent = (): void => {
      const { error } = useUser;
      if (error) {
        setErr(error);
      }
    };
    updateComponent();
  }, [useUser]);

  useEffect(() => {
    if (useAlert?.alerts?.length) {
      const isCriticalToUpdate = useAlert.alerts.some((a) => !a.isSnoozed && a.snoozesAvailable === 0);
      if (isCriticalToUpdate) {
        // eslint-disable-next-line no-console
        // console.log('at least one alert is critical, force open alert dialog');
      } else {
        // eslint-disable-next-line no-console
        // console.log('no alerts in crital state, hide alert dialog');
      }
      setShowAlerts(true);
    }
  }, [useAlert]);

  if (err) {
    // user is unauthorized, redirect them to the onboarding page
    if (err?.response?.status === 401) {
      return <UserOnboarding/>
    } else {
      // render the error
      return <div>ERROR {formatAxiosError(err)}</div>;
    }
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
