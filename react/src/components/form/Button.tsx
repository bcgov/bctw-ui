import { Button as MuiButton, ButtonProps } from '@mui/material';

export default function Button(props: ButtonProps): JSX.Element {
  return <MuiButton size='small' variant='contained' {...props}></MuiButton>;
}
