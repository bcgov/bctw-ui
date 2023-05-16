import { ButtonProps, MenuProps, OutlinedTextFieldProps, StandardTextFieldProps } from '@mui/material';

const baseInputStyle = { marginRight: '10px', marginBottom: '10px', width: '200px', minWidth: '200px' };
const baseInputProps: Pick<OutlinedTextFieldProps, 'variant'> & Pick<StandardTextFieldProps, 'size'> = {
  variant: 'outlined',
  size: 'small'
};

const buttonProps: Pick<ButtonProps, 'size' | 'color'> = {
  size: 'medium',
  color: 'primary'
};

const selectMenuProps: Partial<MenuProps> = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' }
};

export { baseInputStyle, baseInputProps, buttonProps, selectMenuProps };
