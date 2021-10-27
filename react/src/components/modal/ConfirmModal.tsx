import { Typography } from '@mui/material';
import { ModalBaseProps } from 'components/component_interfaces';
import modalStyles from 'components/modal/modal_styles';
import { ReactNode } from 'react';
import { Button, Modal } from 'components/common';

/**
 * props for the simple yes/no style confirmation modal
 * @param btnNoText text to display in the 'no' button
 * @param message either a string or component to display as the main content of the modal
 * @param handleClickYes called when 'yes' is clicked
 */
type ConfirmModalProps = ModalBaseProps & {
  btnNoText?: string;
  btnYesText?: string;
  message: string | ReactNode;
  handleClickYes: (v) => void;
};

export default function ConfirmModal({
  message,
  title,
  open,
  handleClose,
  handleClickYes,
  btnNoText = 'No',
  btnYesText = 'Yes'
}: ConfirmModalProps): JSX.Element {
  const classes = modalStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns}>
        <Button onClick={handleClickYes}>{btnYesText}</Button>
        <Button onClick={(): void => handleClose(false)}>{btnNoText}</Button>
      </div>
    </Modal>
  );
}
