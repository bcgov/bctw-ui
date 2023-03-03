import { TableContainer as MUITableContainer, Paper, Box, useTheme, Theme } from '@mui/material';
import { SxProps } from '@mui/system';

type TableContainerProps = {
  children: JSX.Element; // the table
  toolbar?: JSX.Element; // optional toolbar
  fullScreenHeight?: boolean; // sets height of table to 100%
  sx?: SxProps<Theme>;
};
/**
 * wraps table components
 */
export default function TableContainer({ children, toolbar, fullScreenHeight=false, sx={}}: TableContainerProps): JSX.Element {
  const theme = useTheme();
  return (
    <>
      {toolbar}
      <Paper sx={{ width: '100%', overflow: 'hidden' , ...sx}} variant='outlined'>
        <MUITableContainer  component={Paper} sx={fullScreenHeight ? {...sx, maxHeight: 'calc(100vh - 286px)' }:{ ...sx, maxHeight: '30rem' }}>
          {children}
        </MUITableContainer>
      </Paper>
    </>
  );
}
