import { Modal as MuiModal } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import modalStyles from 'components/modal/modal_styles';
import { ModalProps } from 'components/component_interfaces';

export default function Modal ({open, title, handleClose, children}: ModalProps): JSX.Element {
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