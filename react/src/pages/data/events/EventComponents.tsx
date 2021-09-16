import { BoxProps } from '@material-ui/core';

const boxProps: Pick<BoxProps, 'display' | 'justifyContent' | 'marginBottom'> = {
  display: 'flex',
  marginBottom: '4px',
  // justifyContent: 'space-between'
};

const checkBoxWithLabel:  Pick<BoxProps, 'display' | 'alignItems' | 'flexDirection'> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

export { boxProps, checkBoxWithLabel };
