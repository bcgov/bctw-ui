import { TableContainer as MUITableContainer, Paper, Box, useTheme } from '@mui/material';

type TableContainerProps = {
  children: JSX.Element; // the table
  toolbar?: JSX.Element; // optional toolbar
};
/**
 * wraps table components
 */
export default function TableContainer({ children, toolbar }: TableContainerProps): JSX.Element {
  const theme = useTheme();
  return (
    <>
      {toolbar}
      <Paper sx={{ width: '100%', overflow: 'hidden' }} variant='outlined'>
        <MUITableContainer component={Paper} sx={{ maxHeight: '30rem' }}>
          {children}
        </MUITableContainer>
      </Paper>
    </>
  );
}
