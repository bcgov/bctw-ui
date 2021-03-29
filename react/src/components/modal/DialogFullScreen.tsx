import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { ModalProps } from 'components/component_interfaces';
import { IconButton } from '@material-ui/core';
import { Icon } from 'components/common';
import './modal.scss';
import AppHeader from 'components/common/AppHeader';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function FullScreenDialog({ open, handleClose, children }: ModalProps): JSX.Element {
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppHeader>
        <IconButton edge='start' color='inherit' onClick={(e): void => handleClose(false)}>
          <Icon icon='close' />
        </IconButton>
      </AppHeader>
      <div className={'dlg-full'}>{children}</div>
    </Dialog>
  );
}
