import { Box, TableCell, TableRow, Toolbar, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from 'components/common/partials/SubHeader';
import TableFilter from './TableFilters';
import { ITableFilter } from './table_interfaces';
const useToolbarStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(2)
  },
  highlight:
    theme.palette.mode === 'light' ? { color: theme.palette.secondary.main } : { color: theme.palette.text.primary },

  toolbarTitle: {
    fontWeight: 700,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%'
  },
  actions: {
    float: 'right'
  }
}));

type TableToolbarProps<T> = {
  numSelected: number;
  rowCount: number;
  title: string | JSX.Element;
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
  sibling?: JSX.Element;
  isMultiSearch?: boolean;
  showTooltip?: boolean;
  setPage: (page: number) => void;
  disableSearch?: boolean;
  darkHeader?: boolean;
  //disabled: boolean;
};

export default function TableToolbar<T>(props: TableToolbarProps<T>): JSX.Element {
  const classes = useToolbarStyles();
  const { numSelected, sibling, title, showTooltip, disableSearch, darkHeader } = props;
  return (
    <Toolbar disableGutters className={classes.root}>
      <Box width='100%'>
        {showTooltip && (
          <TableRow selected={true}>
            <TableCell style={{ color: 'black' }}>Current Record</TableCell>
          </TableRow>
        )}
        <Box className={classes.toolbarTitle}>
          {typeof title === 'string' ? <SubHeader text={title} size='small' /> : title}
          &nbsp;
          {numSelected > 0 && <span>({numSelected} Selected)</span>}
          <Box display={'flex'} alignItems={'center'} className={classes.actions}>
            {disableSearch ? null : <TableFilter {...props} />}
            {sibling}
          </Box>
        </Box>
      </Box>
    </Toolbar>
  );
}
