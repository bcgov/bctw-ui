import React from 'react';
import {
  TableCell,
  TableHead as MuiTableHead,
  TableRow,
  TableSortLabel,
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core';
import { Order, HeadCell, typeToHeadCell } from 'components/table/table_helpers';
import { columnToHeader } from 'utils/component_helpers';

const useStyles = makeStyles((theme: Theme) => 
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
      width: 1,
    },
  })
);

interface EnhancedTableProps<T> {
  headerData: T;
  headersToDisplay: string[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
}

export default function TableHead<T>(props: EnhancedTableProps<T>) {
  const classes = useStyles();
  const { order, orderBy, onRequestSort, headerData, headersToDisplay } = props;
  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const headcells: HeadCell<T>[] = typeToHeadCell(headerData, headersToDisplay);

  return (
    <MuiTableHead>
      <TableRow>
        {headcells.map((headCell) => (
          <TableCell
            key={(headCell.id) as string}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {columnToHeader(headCell.label)}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </MuiTableHead>
  );
}