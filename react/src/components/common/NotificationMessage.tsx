import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  err: {},
  success: {}
});

type INotificationMessageProps = {
  message: string;
};
const ErrorMessage = ({message}: INotificationMessageProps) => {
  const classes = useStyles();
  return (
    <Typography color='error' className={classes.err}>
      <strong>{message}</strong>
    </Typography>
  );
}

const SuccessMessage = ({message}: INotificationMessageProps) => {
  const classes = useStyles();
  return (
    <Typography color='primary' className={classes.success}>
      <strong>{message}</strong>
    </Typography>
  );
}


export {
  ErrorMessage,
  SuccessMessage,
}