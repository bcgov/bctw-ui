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
import { columnToHeader } from 'utils/common';
import { T } from 'types/common_types';

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

interface EnhancedTableProps {
  headerData: T;
  headersToDisplay: string[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
}

export default function TableHead(props: EnhancedTableProps) {
  const classes = useStyles();
  const { order, orderBy, onRequestSort, headerData, headersToDisplay } = props;

  const createSortHandler = (property: keyof T) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const headcells: HeadCell<T>[] = typeToHeadCell(headerData, headersToDisplay);

  // any "class" should have a header formatter function, try to use this first 
  const formatHeader = (cell: string) => typeof headerData.formatPropAsHeader === 'function' ? headerData.formatPropAsHeader(cell) : columnToHeader(cell);

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
              {formatHeader(headCell.label)}
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