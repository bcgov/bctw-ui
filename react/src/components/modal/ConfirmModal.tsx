import { Typography, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from 'react';
import Modal from 'components/modal/Modal';
import Button from 'components/form/Button';

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

type IYesNoProps = {
  message: string;
  title?: string;
  show: boolean;
  onClose: (close: any) => void; // also the 'no' handler
  onClickYes: (v: any) => void;
};

export default function YesNo({ message, title, show, onClose, onClickYes }: IYesNoProps) {
  const classes = useStyles();
  return (
    <Modal open={show} handleClose={onClose} title={title}>
      <Typography>{message}</Typography>
      <div className={classes.btns} color='primary'>
        <Button onClick={onClickYes}>yes</Button>
        <Button onClick={onClose}>no</Button>
      </div>
    </Modal>
  );
}