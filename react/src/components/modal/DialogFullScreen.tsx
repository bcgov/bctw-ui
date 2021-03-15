import React from 'react';
import modalStyles from 'components/modal/modal_styles';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { ModalProps } from 'components/component_interfaces';
import { AppBar,Toolbar, IconButton } from '@material-ui/core';
import { Icon } from 'components/common';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function FullScreenDialog({ open, handleClose, children }: ModalProps): JSX.Element {
  const classes = modalStyles();
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <IconButton edge='start' color='inherit' onClick={(e): void => handleClose(false)}>
            <Icon icon='close'/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.paper}>
        <div>{children}</div>
      </div>
    </Dialog>
  );
}
