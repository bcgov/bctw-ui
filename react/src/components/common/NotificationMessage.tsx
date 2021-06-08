import { Typography, makeStyles } from '@material-ui/core';
import { INotificationMessage } from 'components/component_interfaces';

const useStyles = makeStyles({
  err: { color: 'red' },
  success: { color: 'green' }
});

const ResponseMessage = ({ message, severity }: INotificationMessage): JSX.Element => {
  const classes = useStyles();
  return (
    <Typography className={severity === 'error' ? classes.err : classes.success}>
      <strong>{message}</strong>
    </Typography>
  );
};
export default ResponseMessage;
