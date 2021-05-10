import { createStyles, makeStyles, Theme } from '@material-ui/core';

const modalStyles = makeStyles((theme: Theme) =>
  createStyles({
    // todo: only used in editcollar create new collar type selection modal..move
    btns: {
      margin: '20px 10px 0px 10px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    // dialog: {
    //   maxWidth: '80vh'
    // },
    // modal: {
    //   margin: 'auto 0',
    //   display: 'flex',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   maxHeight: '70vh',
    //   overflowY: 'auto',
    // },
    paper: {
      backgroundColor: '#f1f3f5',
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(1, 2, 2),
      overflowY: 'auto',
    },
    title: {
      textAlign: 'center',
    },
  })
);
export default modalStyles;
