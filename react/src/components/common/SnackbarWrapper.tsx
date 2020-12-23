import { Toast } from "components/common";
import { INotificationMessage } from "components/component_interfaces";
import { useState, useEffect } from "react";

type SnackbarWrapperProps = {
  notif: INotificationMessage;
  children: JSX.Element;
}
export default function SnackbarWrapper(props: SnackbarWrapperProps): JSX.Element {
  const { notif } = props;
  const [toastMsg, setToastMsg] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    (() => {
      setToastMsg(notif.message)
      setShowToast(true);
    })()
  }, [notif])

  return (
    <>
      {props.children}
      <Toast show={showToast} message={toastMsg} onClose={(): void => setShowToast(false)} />
    </>
  )
}