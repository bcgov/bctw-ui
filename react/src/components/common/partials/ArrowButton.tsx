import { Button } from '@mui/material';
import { Icon } from 'components/common';

interface ArrowButtonProps {
  onClick?: () => void;
  size: 'small' | 'medium' | 'large';
  label: string;
  rightArrow?: boolean;
}
/**
 * @param onClick handleClick function
 * @param size size of the button
 * @param label inner button text
 * @param righArrow boolean for direction of arrow
 * Returns JSX.Element button with arrow pointing left or right
 */
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
