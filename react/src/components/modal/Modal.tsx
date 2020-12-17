import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Modal as MuiModal } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { ModalBaseProps } from 'components/component_interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    title: {
      textAlign: 'center'
    }
  }),
);

type IModalProps = ModalBaseProps & {
  children: React.ReactNode;
}

export default function Modal ({open, title, handleClose, children}: IModalProps) {
  const classes = useStyles();

  return (
    <div>
      <MuiModal
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className={classes.paper}>
            <h2 className={classes.title}>{title ?? ''}</h2>
            <div id='transition-modal-description'>
              {children}
            </div>
          </div>
        </Fade>
      </MuiModal>
    </div>
  );
}