import {
  createStyles,
  Checkbox,
  makeStyles,
  TableCell,
  TableHead as MuiTableHead,
  TableRow,
  TableSortLabel
} from '@material-ui/core';
import { createHeadCell } from 'components/table/table_helpers';
import { BCTW } from 'types/common_types';
import { columnToHeader } from 'utils/common';
import { HeadCell, ITableHeadProps } from './table_interfaces';

const useStyles = makeStyles(() =>
  createStyles({
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1
    }
  })
);

export default function TableHead<T>(props: ITableHeadProps<T>): JSX.Element {
  const classes = useStyles();
  const {
    customHeaders,
    order,
    orderBy,
    onRequestSort,
    headerData,
    headersToDisplay,
    numSelected,
    onSelectAllClick,
    rowCount,
    isMultiSelect
  } = props;

  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>): void => {
    onRequestSort(event, property);
  };
  const headcells: HeadCell<T>[] = createHeadCell(headerData, headersToDisplay);

  // all BCTW classes should have a header formatter method
  const formatHeader = (cell: string): string =>
    typeof (headerData as BCTW).formatPropAsHeader === 'function'
      ? (headerData as BCTW).formatPropAsHeader(cell)
      : columnToHeader(cell);

  return (
    <MuiTableHead>
      <TableRow>
        {/* render the select all checkbox if the table is multi-select mode */}
        {isMultiSelect ? (
          <TableCell padding='checkbox'>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all' }}
            />
          </TableCell>
        ) : null}
        {/* render the rest of the header row */}
        {headcells.map((headCell) => (
          <TableCell
            key={headCell.id as string}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              <strong>{formatHeader(headCell.label)}</strong>
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        {/* if any custom columns were supplied to the table, render their headers */}
        {/* fixme: add key */}
        {customHeaders
          ? customHeaders.map(
            (header): JSX.Element => {
              const component = header(headerData,0);
              return <TableCell>{component}</TableCell>;
            }
          )
          : null}
      </TableRow>
    </MuiTableHead>
  );
}
