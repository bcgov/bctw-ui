import { BoxProps } from '@mui/material';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent' | 'alignItems' | 'columnGap'> = {
  columnGap: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export { boxSpreadRowProps };
