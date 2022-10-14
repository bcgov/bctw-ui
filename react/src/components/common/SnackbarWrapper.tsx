import { Toast } from "components/common";
import { useResponseState } from "contexts/ApiResponseContext";
import { useState, useEffect } from "react";

type SnackbarWrapperProps = {
  children: JSX.Element;
}
export default function SnackbarWrapper({children}: SnackbarWrapperProps): JSX.Element {
  const responseState = useResponseState();
  const [showToast, setShowToast] = useState(false);

  const handleClose = (): void => {
    setShowToast(false); 
    responseState?.callback?.();
  }

  useEffect(() => {
    ((): void => {
      if (responseState) {
        const { message, severity } = responseState;
        if (message || severity === 'error') {
          setShowToast(true);
        } else {
          setShowToast(false);
        }
      }
    })()
  }, [responseState])

  return (
    <>
      {children}
      {responseState && (<Toast severity={responseState?.severity} show={showToast} message={responseState?.message} onClose={(): void => {handleClose();}} />)}
    </>
  )
}