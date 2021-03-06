import { Button as MuiButton, ButtonProps } from '@material-ui/core';

export default function Button(props: ButtonProps): JSX.Element {
  return <MuiButton size='small' variant='contained' color='primary' {...props}></MuiButton>;
}
