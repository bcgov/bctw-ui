import { BoxProps } from '@material-ui/core';

// const boxProps: Pick<BoxProps, 'display' | 'justifyContent' | 'marginBottom'> = {
//   display: 'flex',
//   marginBottom: '12px',
// };

const boxRowProps:  Pick<BoxProps, 'display' | 'alignItems' | 'flexDirection'> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

export { boxRowProps };
