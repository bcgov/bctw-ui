import { Dialog } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import modalStyles from 'components/modal/modal_styles';
import { ModalProps } from 'components/component_interfaces';

export default function Modal(props: ModalProps): JSX.Element {
  const { open, title, handleClose, children } = props;
  // todo: merge styles
  const classes = modalStyles();
  return (
    <Dialog
      className={'dialog-modal'}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      {...props}>
      <Fade in={open}>
        <div className={classes.paper}>
          {title ? <h2 className={classes.title}>{title}</h2> : null}
          <div>{children}</div>
        </div>
      </Fade>
    </Dialog>
  );
}
