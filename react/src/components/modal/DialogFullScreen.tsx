import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import Slide from '@material-ui/core/Slide';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { TransitionProps } from '@material-ui/core/transitions';
import { ModalProps } from 'components/component_interfaces';
import { IconButton } from '@material-ui/core';
import { Icon } from 'components/common';
import './modal.scss';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowBack from '@material-ui/icons/ArrowBack';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { classicNameResolver } from 'typescript';

const useStyles = makeStyles((theme: Theme) => ({
  fsDialogBackBtn: {
    color: '#ffffff'
  },
  fsDialogHeader: {
    height: '70px'
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

export default function FullScreenDialog({ open, handleClose, children }: ModalProps): JSX.Element {
  const classes = useStyles();
  
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}>
      <AppBar elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters className={classes.fsDialogHeader}>
            <Button
              className={classes.fsDialogBackBtn}
              size="large"
              variant="text"
              color="primary"
              disableElevation
              startIcon={<ArrowBack />}
              onClick={(e): void => handleClose(false)}>
              Cancel and Exit
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      {children}
    </Dialog>
  );
}
