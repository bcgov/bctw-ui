import { Theme } from '@mui/material';

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

const modalStyles = makeStyles((theme: Theme) =>
  createStyles({
    // todo: only used in editcollar create new collar type selection modal..move
    btns: {
      margin: '20px 10px 0px 10px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    paper: {
      backgroundColor: '#f1f3f5',
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(1, 2, 2),
      overflowY: 'auto',
    },
    title: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
  })
);
export default modalStyles;
