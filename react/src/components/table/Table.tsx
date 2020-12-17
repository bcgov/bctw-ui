import React, { useState } from 'react';
import {
  makeStyles,
  createStyles,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Toolbar,
  Typography,
  Paper
} from '@material-ui/core';
import { getComparator, Order, stableSort } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';

/* todo: 
  - pagination
  - double table select multiple row issue
  - should table header be a toolbar?
  - format cells (dates)
*/

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    table: {
      minWidth: 650,
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    toolbar: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    title: {
      flex: '1 1 100%',
    },
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

type ITableProps<T> = {
  data: T[];
  headers: string[];
  title?: string;
  onSelect?: (row: T) => void;
  rowIdentifier?: string;
}

/**
 * 
 * @param data array of data that is to be displayed in the table
 * @param headers assuming not all data properties are displayed in the table. * required
 * @param onSelect handler from parent component
 * @param rowIdentifier what uniquely identifies a row (ex device_id for a collar). will default to id
 */
export default function Table<T>({ data, title, headers, onSelect, rowIdentifier = 'id' }: ITableProps<T>) {
  const classes = useStyles();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(rowIdentifier as any);
  const [selected, setSelected] = useState<number>(null);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    setSelected(id);
    const row = data.find(d => d[rowIdentifier] === id);
    if (typeof onSelect === 'function') {
      onSelect(row);
    }
  }
  const isSelected = (id: number) => selected === id;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {title ?
          <Toolbar className={classes.toolbar}>
            <Typography className={classes.title} variant="h6" component="div">
              <strong>{title}</strong>
            </Typography>
          </Toolbar> : <></>
        }
        <TableContainer component={Paper}>
          <MuiTable className={classes.table} size="small">
            <TableHead
              headersToDisplay={headers}
              headerData={data[0]}
              order={order}
              orderBy={orderBy as string ?? ''}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {
                stableSort(data, getComparator(order, orderBy))
                  .map((obj: T, prop: number) => {
                    const isRowSelected = isSelected(obj[rowIdentifier])
                    return (
                      <TableRow
                        key={prop}
                        selected={isRowSelected}
                        onClick={(event) => handleClick(event, obj[rowIdentifier])}
                      >
                        {
                          headers.map((k: string, i: number) => {
                            return <TableCell key={`${k}${i}`} align='right'>{obj[k]}</TableCell>
                          })
                        }
                      </TableRow>
                    )
                  })
              }
            </TableBody>
          </MuiTable>
        </TableContainer>
      </Paper>
    </div>
  );
}