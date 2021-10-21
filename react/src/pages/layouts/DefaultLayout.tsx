import { useState, useEffect, useContext } from 'react';
import { UserContext } from 'contexts/UserContext';
import { AlertContext } from 'contexts/UserAlertContext';
import UserAlert from 'pages/user/UserAlertPage';
import { Modal } from 'components/common';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import UserOnboarding from 'pages/onboarding/UserOnboarding';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { isDev } from 'api/api_helpers';
import { doNothing } from 'utils/common_helpers';

type IDefaultLayoutProps = {
  children: React.ReactNode;
};

/**
 * wrap this component around child components that require the user to exist
 * 
 * assuming the user exists, also forces open the alerts modal if there are alerts that require action
 */
export default function DefaultLayout({ children }: IDefaultLayoutProps): JSX.Element {
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);
  const [err, setErr] = useState<AxiosError | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [mustUpdateAlert, setMustUpdateAlert] = useState(false);

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
      // const dealWithIt = useAlert.alerts.some((a) => !a.isSnoozed && a.snoozesAvailable === 0);
      // forces users to deal with alerts if they are not currently snoozed (unless in development)
      const dealWithIt = useAlert.alerts.some((a) => !a.isSnoozed) && !isDev();
      setMustUpdateAlert(dealWithIt);
    }
  }, [useAlert]);

  useDidMountEffect(() => {
    if (mustUpdateAlert) {
      setShowAlerts(true)
    } else {
      setShowAlerts(false);
    }
  }, [mustUpdateAlert]);

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
    handleClose: mustUpdateAlert ? doNothing : (): void => setShowAlerts(false)
  };

  return (
    <>
      <Modal title={useAlert?.getAlertTitle()} open={showAlerts} {...disableCloseModalProps}>
        <UserAlert />
      </Modal>
      {children}
    </>
  );
}
