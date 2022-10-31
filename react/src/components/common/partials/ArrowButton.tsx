import { Button, Link, Typography, TypographyProps } from '@mui/material';
import { Icon } from 'components/common';
type S = {
  variant: TypographyProps['variant'];
  iconSize: number;
};
type StylesType = {
  small: S;
  medium: S;
  large: S;
};
interface ArrowButtonProps {
  onClick?: () => void;
  size: 'small' | 'medium' | 'large';
  label: string;
  rightArrow?: boolean;
}
export const ArrowButton = ({ onClick, size, label, rightArrow = true }: ArrowButtonProps): JSX.Element => {
  return (
    <Button
      onClick={onClick}
      size={size}
      startIcon={!rightArrow && <Icon icon={'back-extended'} />}
      endIcon={rightArrow && <Icon icon={'back-extended'} rotate={rightArrow && 180} />}>
      {label}
    </Button>
  );
};
