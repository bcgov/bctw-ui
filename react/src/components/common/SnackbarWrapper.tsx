import { Toast } from "components/common";
import { useResponseState } from "contexts/ApiResponseContext";
import { useState, useEffect } from "react";

type SnackbarWrapperProps = {
  children: JSX.Element;
}
export default function SnackbarWrapper(props: SnackbarWrapperProps): JSX.Element {
  const responseState = useResponseState();
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    ((): void => {
      if (responseState?.message?.length || responseState?.type === 'error') {
        setShowToast(true);
      } else {
        setShowToast(false);
      }
    })()
  }, [responseState])

  return (
    <>
      {props.children}
      <Toast show={showToast} message={responseState?.message} onClose={(): void => setShowToast(false)} />
    </>
  )
}