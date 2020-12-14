import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  err: {}
});

type IErrorMessageProps = {
  message: string;
};
export default function ErrorMessage({message}: IErrorMessageProps){
  const classes = useStyles();
  return (
    <Typography color='error' className={classes.err}>
      <strong>{message}</strong>
    </Typography>
  );
}
