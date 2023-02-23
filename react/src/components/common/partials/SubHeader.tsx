import { Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
interface SubHeaderProps {
  text: string;
  size?: 'large' | 'small' | 'extra-small';
  dark?: boolean;
}
/**
 * @param text Subheader text
 * Returns a stylized subheader, used with data tables and ui layouts.
 */
export const SubHeader = ({ text, size = 'large', dark = false }: SubHeaderProps) => {
  const sizeDict = { 
    'large' : 'h4',
    'small' : 'h5',
    'extra-small' : 'h6'
  }
  return (
  <Typography
    sx={{
      margin: 0,
      padding: 0,
      verticalAlign: 'bottom'
    }}
    variant={sizeDict[size] as Variant}
    color={dark ? 'text.primary' : 'text.secondary'}>
    {text ?? <span>&nbsp;</span>}
  </Typography>
)};
