import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions';
import { ModalProps } from 'components/component_interfaces';
import React from 'react';
import './modal.scss';

import makeStyles from '@mui/styles/makeStyles';
import { Button, Icon } from 'components/common';
import { urls } from 'constants/external_urls';

const useStyles = makeStyles(() => ({
  appBar: {
    borderRadius: '0 0 0 0'
  },
  fsDialogHeader: {
    height: '70px'
  },
  fsDialogBackBtn: {
    marginRight: 'auto',
    color: '#ffffff',
    float: 'left',
    paddingLeft: 0
  },
  fsDialogHelpBtn: {
    color: '#ffffff',
    float: 'right',
    paddingRight: 0
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return (
    <Fade ref={ref} {...props}>
      {props.children}
    </Fade>
  );
});

export default function FullScreenDialog({ open, handleClose, children }: ModalProps): JSX.Element {
  const classes = useStyles();
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar elevation={0} className={classes.appBar}>
        <Container maxWidth='md'>
          <Toolbar disableGutters className={classes.fsDialogHeader}>
            <Button
              className={classes.fsDialogBackBtn}
              variant='text'
              disableElevation
              startIcon={<Icon icon={'back'} />}
              onClick={(): void => handleClose(false)}>
              Back
            </Button>
            <Button
              className={classes.fsDialogHelpBtn}
              variant='text'
              disableElevation
              startIcon={<Icon icon={'help'} />}
              onClick={(): void => {
                window.open(urls.bctw_support_url);
              }}>
              Help
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      {children}
    </Dialog>
  );
}
