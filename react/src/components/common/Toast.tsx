import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Portal } from '@material-ui/core';

type IToastProps = {
  message: string;
  show: boolean;
  action?: React.ReactNode;
  onClose: () => void;
}
export default function Toast({message, show, action, onClose}: IToastProps): JSX.Element {
  return (
    <>
      <Portal>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={show}
          autoHideDuration={5000}
          onClose={onClose}
          message={message}
          action={action}
        />
      </Portal>
    </>
  );
}