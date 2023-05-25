import { ButtonProps, MenuProps, OutlinedTextFieldProps, StandardTextFieldProps } from '@mui/material';
const inputWidth = 200;
const marginRight = 10;
const commentWidth = inputWidth * 2 + marginRight;
const baseInputStyle = { marginRight, marginBottom: '15px', width: inputWidth, minWidth: inputWidth };
const commentInputStyle = {
  ...baseInputStyle,
  width: commentWidth
};
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

export { baseInputStyle, baseInputProps, buttonProps, selectMenuProps, commentInputStyle };
