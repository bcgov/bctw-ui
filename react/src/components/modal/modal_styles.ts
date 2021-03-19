import { createStyles, makeStyles, Theme } from '@material-ui/core';

const modalStyles = makeStyles((theme: Theme) =>
  createStyles({
    btns: {
      margin: '20px 10px 0px 10px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'scroll',
      height: '100%',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    },
    title: {
      textAlign: 'center',
    },
  })
);
export default modalStyles;
