import { TableContainer as MUITableContainer, Paper, Box, useTheme } from '@mui/material';

type TableContainerProps = {
  children: JSX.Element; // the table
  toolbar?: JSX.Element; // optional toolbar
  fullScreenHeight?: boolean; // sets height of table to 100%
};
/**
 * wraps table components
 */
export default function TableContainer({ children, toolbar, fullScreenHeight=false }: TableContainerProps): JSX.Element {
  const theme = useTheme();
  return (
    <>
      {toolbar}
      <Paper sx={{ width: '100%', overflow: 'hidden' }} variant='outlined'>
        <MUITableContainer component={Paper} sx={{ maxHeight: fullScreenHeight ? '100%':'30rem' }}>
          {children}
        </MUITableContainer>
      </Paper>
    </>
  );
}
