import { Typography } from '@mui/material';
interface SubHeaderProps {
  text: string;
}
/**
 * @param text Subheader text
 * Returns a stylized subheader, used with data tables and ui layouts.
 */
export const SubHeader = ({ text }: SubHeaderProps) => (
  <Typography
    sx={{
      margin: 0,
      padding: 0,
      verticalAlign: 'bottom'
    }}
    variant='h4'
    color='text.secondary'>
    {text ?? <span>&nbsp;</span>}
  </Typography>
);
