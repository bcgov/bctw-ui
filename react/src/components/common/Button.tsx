import { Button as MuiButton, ButtonProps } from '@mui/material';

export default function Button(props: ButtonProps): JSX.Element {
  return <MuiButton size='large' variant='contained' {...props}></MuiButton>;
}
