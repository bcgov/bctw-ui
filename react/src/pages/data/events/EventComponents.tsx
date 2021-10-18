import { BoxProps } from '@mui/material';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent' | 'alignItems'> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export { boxSpreadRowProps };
