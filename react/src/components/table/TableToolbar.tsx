import { makeStyles, Toolbar, Typography, lighten } from '@material-ui/core';
import clsx from 'clsx';
import TableFilter from './TableFilters';
import { ITableFilter } from './table_interfaces';

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  title: {
    flex: '1 1 100%'
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
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0
      })}>
      {numSelected > 0 ? (
        <Typography className={classes.title} color='inherit' variant='subtitle1' component='div'>
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant='h6' id='tableTitle' component='div'>
          {title ?? ''}
        </Typography>
      )}
      <TableFilter {...props} />
    </Toolbar>
  );
}
