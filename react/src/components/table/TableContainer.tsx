import { TableContainer as MUITableContainer, Paper } from '@material-ui/core';

type TableContainerProps = {
  children: JSX.Element; // the table
  toolbar?: JSX.Element; // optional toolbar
};
/**
 * wraps table components
 */
export default function TableContainer({ children, toolbar }: TableContainerProps): JSX.Element {
  return (
    <div className={'root'}>
      <Paper className={'paper'}>
        {toolbar}
        <MUITableContainer component={Paper}>{children}</MUITableContainer>
      </Paper>
    </div>
  );
}
