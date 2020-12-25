import { Typography, createStyles, makeStyles, Theme } from "@material-ui/core";
import Modal from 'components/modal/Modal';
import Button from 'components/form/Button';
import { ConfirmModalProps } from 'components/component_interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    btns: {
      margin: '20px 10px 0px 10px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
  })
);


export default function ConfirmModal({ message, title, open, handleClose, handleClickYes, btnNoText = 'no', btnYesText = 'yes' }: ConfirmModalProps): JSX.Element {
  const classes = useStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns} color='primary'>
        <Button onClick={handleClickYes}>{btnYesText}</Button>
        <Button onClick={handleClose}>{btnNoText}</Button>
      </div>
    </Modal>
  );
}