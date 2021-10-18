import { ButtonProps, OutlinedTextFieldProps, StandardTextFieldProps } from '@mui/material';

const baseInputStyle = { marginRight: '10px', width: '200px' };
const baseInputProps: Pick<OutlinedTextFieldProps, 'variant'> & Pick<StandardTextFieldProps, 'size'> = {
  variant: 'outlined',
  size: 'small'
};

const buttonProps: Pick<ButtonProps, 'size' | 'color'> = {
  size: 'large',
  color: 'primary'
};
export { baseInputStyle, baseInputProps, buttonProps };
