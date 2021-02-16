import React from 'react';
import { Modal as MuiModal } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { ModalBaseProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';

type IModalProps = ModalBaseProps & {
  children: React.ReactNode;
}

export default function Modal ({open, title, handleClose, children}: IModalProps): JSX.Element {
  const classes = modalStyles();

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
            <div>
              {children}
            </div>
          </div>
        </Fade>
      </MuiModal>
    </div>
  );
}