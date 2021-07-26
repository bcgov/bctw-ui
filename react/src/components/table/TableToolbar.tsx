import { makeStyles, Box, Toolbar, Typography, lighten } from '@material-ui/core';
import clsx from 'clsx';
import TableFilter from './TableFilters';
import { ITableFilter } from './table_interfaces';

import { Icon } from 'components/common';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          //backgroundColor: lighten(theme.palette.primary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          //backgroundColor: theme.palette.primary.dark
        },

  toolbarInner: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  },
  
  toolbarTitle: {
    fontWeight: 700,
  }
}));

type TableToolbarProps<T> = {
  numSelected: number;
  rowCount: number;
  title: string;
  filterableProperties: string[];
  onChangeFilter: (filter: ITableFilter) => void;
};

export default function TableToolbar<T>(props: TableToolbarProps<T>): JSX.Element {
  const classes = useToolbarStyles();
  const { numSelected, title } = props;

  return (
    <Toolbar disableGutters>
      <Box className={classes.toolbarInner} display="flex" alignItems="center" justifyContent="space-between" width="100%">
        <Box className={classes.toolbarTitle}>
          {title ?? ''} &nbsp;
          {numSelected > 0 ? (
            <span>({numSelected} selected)</span>
          ) : (
            <span>{''}</span>
          )}
        </Box>
        <Box>
          <TableFilter {...props} />
        </Box>
      </Box>
    </Toolbar>
  );
}
