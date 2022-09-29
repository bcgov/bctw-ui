import { Checkbox, TableCell, TableHead as MuiTableHead, TableRow, TableSortLabel } from '@mui/material';
import { createHeadCell } from 'components/table/table_helpers';
import { BCTWBase } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { HeadCell, TableHeadProps } from 'components/table/table_interfaces';

export default function TableHead<T extends BCTWBase<T>>(props: TableHeadProps<T>): JSX.Element {
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

  const createSortHandler =
    (property: keyof T) =>
    (event: React.MouseEvent<unknown>): void => {
      onRequestSort(event, property);
    };

  // use default formatter if T doesnt implement formatPropAsHeader
  const formatHeader = (cell: keyof T): string =>
    typeof headerData.formatPropAsHeader === 'function'
      ? headerData.formatPropAsHeader(cell)
      : columnToHeader(cell as string);
  return (
    <MuiTableHead>
      {!headerData ? null : (
        <TableRow>
          {/* render the select all checkbox if the table is multi-select mode */}
          {isMultiSelect ? (
            <TableCell padding='checkbox'>
              <Checkbox
                /* 
                  renders a dash when 'some' values are checked. 
                */
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': 'select all' }}
              />
            </TableCell>
          ) : null}
          {/* render the rest of the header row */}
          {createHeadCell(headerData, headersToDisplay).map((headCell: HeadCell<T>) => (
            <TableCell
              key={String(headCell.id)}
              align={'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}>
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}>
                {formatHeader(headCell.id)}
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
            ? customHeaders.map((header, idx): JSX.Element => {
                const Header = header(headerData, 0);
                return <TableCell key={`add-h-${idx}`}>{Header}</TableCell>;
              })
            : null}
        </TableRow>
      )}
    </MuiTableHead>
  );
}
