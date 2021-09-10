import { BoxProps } from '@material-ui/core';

const boxProps: Pick<BoxProps, 'display' | 'justifyContent'> = {
  display: 'flex',
  justifyContent: 'space-between'
};

export { boxProps };
