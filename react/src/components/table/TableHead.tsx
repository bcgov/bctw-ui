import {
  Checkbox,
  TableCell,
  TableHead as MuiTableHead,
  TableRow,
  TableSortLabel
} from '@material-ui/core';
import { createHeadCell } from 'components/table/table_helpers';
import { BCTW } from 'types/common_types';
import { columnToHeader } from 'utils/common';
import { ITableHeadProps } from './table_interfaces';

export default function TableHead<T extends BCTW>(props: ITableHeadProps<T>): JSX.Element {
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

  // use default formatter if T doesnt implement its own version
  const formatHeader = (cell: string): string =>
    typeof headerData.formatPropAsHeader === 'function' ? headerData.formatPropAsHeader(cell) : columnToHeader(cell);

  return (
    <MuiTableHead>
      {!headerData ? null : (
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
          {createHeadCell(headerData, headersToDisplay).map((headCell) => (
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
                  <span className={'visuallyHidden'}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          {/* if any custom columns were supplied to the table, render their headers */}
          {customHeaders
            ? customHeaders.map(
              (header, idx): JSX.Element => {
                const component = header(headerData, 0);
                return <TableCell key={`add-h-${idx}`}>{component}</TableCell>;
              }
            )
            : null}
        </TableRow>
      )}
    </MuiTableHead>
  );
}
