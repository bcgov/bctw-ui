import { Button as MuiButton } from '@material-ui/core';

export default function Button(props) {
  return <MuiButton size='small' variant='contained' color='primary' {...props}></MuiButton>;
}
