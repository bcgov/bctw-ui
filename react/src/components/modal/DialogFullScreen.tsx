import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme } from '@material-ui/core/styles/createTheme';
import { TransitionProps } from '@material-ui/core/transitions';
import { ModalProps } from 'components/component_interfaces';
import './modal.scss';

import ArrowBack from '@material-ui/icons/ArrowBack';
import HelpIcon from '@material-ui/icons/Help';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { classicNameResolver } from 'typescript';

const useStyles = makeStyles((theme: Theme) => ({
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
            <Button
              className={classes.fsDialogHelpBtn}
              size="large"
              variant="text"
              color="primary"
              disableElevation
              startIcon={<HelpIcon />}
              onClick={(e): void => {window.open('https://apps.nrs.gov.bc.ca/int/confluence/display/BCTW/Project+Support+and+Documentation')}}>
                Help
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      {children}
    </Dialog>
  );
}
