import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Portal } from '@material-ui/core';

type IToastProps = {
  message: string;
  show: boolean;
  action?: React.ReactNode;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info' | 'success';
};

// todo: style snackbar 
export default function Toast({ message, show, action, onClose, type }: IToastProps): JSX.Element {
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
          onClose={onClose}
          action={action}
          message={message}
        />
      </Portal>
    </>
  );
}
