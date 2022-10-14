import { Box, TableCell, TableRow, Toolbar, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { SubHeader } from 'components/common/partials/SubHeader';
import TableFilter from './TableFilters';
import { ITableFilter } from './table_interfaces';
const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.mode === 'light' ? { color: theme.palette.secondary.main } : { color: theme.palette.text.primary },

  toolbarInner: {
    //paddingRight: theme.spacing(2)
    //paddingLeft: theme.spacing(2)
  },
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
  title: string;
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
  sibling?: JSX.Element;
  isMultiSearch?: boolean;
  showTooltip?: boolean;
  setPage: (page: number) => void;
  //disabled: boolean;
};

export default function TableToolbar<T>(props: TableToolbarProps<T>): JSX.Element {
  const classes = useToolbarStyles();
  const { numSelected, sibling, title, showTooltip } = props;
  return (
    <Toolbar disableGutters>
      <Box className={classes.toolbarInner} width='100%'>
        {showTooltip && (
          <TableRow selected={true}>
            <TableCell style={{ color: 'black' }}>Current Record</TableCell>
          </TableRow>
        )}
        <Box className={classes.toolbarTitle}>
          <SubHeader text={title} />
          &nbsp;
          {numSelected > 0 && <span>({numSelected} Selected)</span>}
          <Box display={'flex'} alignItems={'center'} className={classes.actions}>
            <TableFilter {...props} />
            {sibling}
          </Box>
        </Box>
      </Box>
    </Toolbar>
  );
}
