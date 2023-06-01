import React from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { Portal } from '@mui/material';
import Alert, { AlertProps } from '@mui/material/Alert';

type IToastProps = Pick<AlertProps, 'severity'> & {
  message: string;
  show: boolean;
  action?: React.ReactNode;
  onClose: () => void;
};

export default function Toast({ message, show, action, onClose, severity }: IToastProps): JSX.Element {
  const onCloseHandler = (event: unknown, reason: SnackbarCloseReason): void => {
    if (reason !== 'clickaway') {
      onClose();
    }
    //Disables clickaway functionality^ Added this since clickaway is triggered on download completion, which would dismiss snackbars.
    //I think this change is fine, since it does not affect autoHide timeout or the X buttons.
  };

  return (
    <>
      <Portal>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          open={show}
          autoHideDuration={8000}
          onClose={onCloseHandler}
          action={action}>
          <Alert onClose={onClose} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      </Portal>
    </>
  );
}
