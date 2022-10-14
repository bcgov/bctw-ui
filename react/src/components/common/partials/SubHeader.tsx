import { Typography } from '@mui/material';
interface SubHeaderProps {
  text: string;
}
export const SubHeader = ({ text }: SubHeaderProps) => (
  <Typography
    sx={{
      margin: 0,
      padding: 0,
      verticalAlign: 'bottom'
    }}
    variant='h4'
    color='text.secondary'>
    {text ?? ''}
  </Typography>
);
