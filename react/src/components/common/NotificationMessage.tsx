import { Typography, makeStyles } from '@material-ui/core';
import { INotificationMessage } from 'components/component_interfaces';

const useStyles = makeStyles({
  err: {
    color: 'red'
  },
  success: {
    color: 'green'
  }
});


const ResponseMessage = ({message, type}: INotificationMessage) => {
  const classes = useStyles();
  return (
    <Typography 
      className={type=== 'error' ? classes.err : classes.success}
    >
      <strong>{message}</strong>
    </Typography>
  );
}
export default ResponseMessage;