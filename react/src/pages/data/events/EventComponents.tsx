import { BoxProps } from '@material-ui/core';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent' | 'alignItems'> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export { boxSpreadRowProps };
