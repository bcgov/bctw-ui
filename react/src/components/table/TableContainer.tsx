import { TableContainer as MUITableContainer, Paper } from '@mui/material';

type TableContainerProps = {
  children: JSX.Element; // the table
  toolbar?: JSX.Element; // optional toolbar
};
/**
 * wraps table components
 */
export default function TableContainer({ children, toolbar }: TableContainerProps): JSX.Element {
  return (
    <Paper className={'paper'}>
      {toolbar}
      <MUITableContainer className={'table-container'} component={Paper}>
        {children}
      </MUITableContainer>
    </Paper>
  );
}
