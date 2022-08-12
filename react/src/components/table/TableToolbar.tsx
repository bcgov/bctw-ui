import { Box, Table, TableBody, TableCell, TableRow, Toolbar } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import TableFilter from './TableFilters';
import { ITableFilter } from './table_interfaces';

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.mode === 'light'
      ? { color: theme.palette.secondary.main }
      : { color: theme.palette.text.primary },

  toolbarInner: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  },
  toolbarTitle: {
    fontWeight: 700
  }
}));

type TableToolbarProps<T> = {
  numSelected: number;
  rowCount: number;
  title: string;
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
  sibling?: JSX.Element;
  isMultiSearch?: boolean;
  showTooltip?: boolean;
  setPage: (page: number) => void;
  disabled: boolean;
};

export default function TableToolbar<T>(props: TableToolbarProps<T>): JSX.Element {
  const classes = useToolbarStyles();
  const { numSelected, sibling, title, showTooltip } = props;
  return (
    <Toolbar disableGutters>
      <Box
        className={classes.toolbarInner}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width='100%'>
      {showTooltip && <TableRow selected={true}><TableCell style={{color: 'black'}}>Current Record</TableCell></TableRow>}
        <Box className={classes.toolbarTitle}>
          {title ?? ''} &nbsp;
          {numSelected > 0 ? <span>({numSelected} selected)</span> : <span>{''}</span>}
        </Box>
        <Box display={'flex'} alignItems={'center'}>
          <TableFilter {...props} />
          {sibling}
        </Box>
      </Box>
    </Toolbar>
  );
}
