import { Typography } from '@mui/material';
interface SubHeaderProps {
  text: string;
  size?: 'large' | 'small';
  dark?: boolean;
}
/**
 * @param text Subheader text
 * Returns a stylized subheader, used with data tables and ui layouts.
 */
export const SubHeader = ({ text, size = 'large', dark = false }: SubHeaderProps) => (
  <Typography
    sx={{
      margin: 0,
      padding: 0,
      verticalAlign: 'bottom'
    }}
    variant={size === 'small' ? 'h5' : 'h4'}
    color={dark ? 'text.primary' : 'text.secondary'}>
    {text ?? <span>&nbsp;</span>}
  </Typography>
);
