import { Typography, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from 'react';
import Modal from 'components/modal/Modal';
import Button from 'components/form/Button';
import { ModalBaseProps } from 'components/component_interfaces';

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

type ConfirmModalProps = ModalBaseProps & {
  message: string;
  handleClickYes: (v: any) => void;
};

export default function ConfirmModal({ message, title, open, handleClose, handleClickYes }: ConfirmModalProps) {
  const classes = useStyles();
  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns} color='primary'>
        <Button onClick={handleClickYes}>yes</Button>
        <Button onClick={handleClose}>no</Button>
      </div>
    </Modal>
  );
}