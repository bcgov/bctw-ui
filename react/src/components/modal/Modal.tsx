import { Dialog, IconButton } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import modalStyles from 'components/modal/modal_styles';
import { ModalProps } from 'components/component_interfaces';
import { Icon } from 'components/common';

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
          <div className={classes.title}>
            <h3>{title}</h3>
            {/* if this prop was passed, dont show the close button */}
            {props.disableBackdropClick ? null : (
              <IconButton style={{float: 'right'}} onClick={(): void => handleClose(false)}>
                <Icon icon='close' />
              </IconButton>
            )}
          </div>
          <div>{children}</div>
        </div>
      </Fade>
    </Dialog>
  );
}
