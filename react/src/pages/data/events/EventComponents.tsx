import { BoxProps } from '@material-ui/core';

const boxSpreadRowProps: Pick<BoxProps, 'display' | 'justifyContent'> = {
  display: 'flex',
  justifyContent: 'space-between',
};

// const boxRowProps:  Pick<BoxProps, 'display' | 'alignItems' | 'flexDirection'> = {
//   display: 'flex',
//   flexDirection: 'row',
//   alignItems: 'center',
// }

export { boxSpreadRowProps };
