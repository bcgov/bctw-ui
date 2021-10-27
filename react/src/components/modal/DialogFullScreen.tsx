import React from 'react';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions';
import { ModalProps } from 'components/component_interfaces';
import './modal.scss';

import makeStyles from '@mui/styles/makeStyles';
import { Button, Icon } from 'components/common';
import { urls } from 'constants/external_urls';

const useStyles = makeStyles(() => ({
  fsDialogHeader: {
    height: '70px',
  },
  fsDialogBackBtn: {
    marginRight: 'auto',
    color: '#ffffff',
    float: 'left'
  },
  fsDialogHelpBtn: {
    color: '#ffffff',
    float: 'right'
  }
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props}>{props.children}</Fade>;
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
              variant='text'
              disableElevation
              startIcon={<Icon icon={'back'}/>}
              onClick={(): void => handleClose(false)}>
                Cancel and Exit
            </Button>
            <Button
              className={classes.fsDialogHelpBtn}
              variant='text'
              disableElevation
              startIcon={<Icon icon={'help'}/>}
              onClick={(): void => {window.open(urls.bctw_support_url)}}>
                Help
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      {children}
    </Dialog>
  );
}
