import { Typography } from "@material-ui/core";
import Modal from 'components/modal/Modal';
import Button from 'components/form/Button';
import { ConfirmModalProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';

export default function ConfirmModal({ message, title, open, handleClose, handleClickYes, btnNoText = 'no', btnYesText = 'yes' }: ConfirmModalProps): JSX.Element {
  const classes = modalStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns} color='primary'>
        <Button onClick={handleClickYes}>{btnYesText}</Button>
        <Button onClick={():void => handleClose(false)}>{btnNoText}</Button>
      </div>
    </Modal>
  );
}