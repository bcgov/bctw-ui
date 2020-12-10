import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createStyles, Table as MuiTable, Theme, Toolbar, Typography } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
// import PaginationActions from 'components/table/Pagination';

/* todo: 
  -selected looking id while only critters have an id
  -get pagination working
  - double table select multiple row issue
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
  })
);

type ITableProps<T> = {
  data: T[];
  headers: string[]; // array of what properties should be displayed
  title?: string;
  onSelect?: (row: T) => void;
  rowIdentifier?: string; // what uniquely identifies a row (ex device_id for a collar)
}

export default function Table<T>({data, title, headers, onSelect, rowIdentifier = 'id'}: ITableProps<T>) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState<number>(null);
  // const [rowsPerPage, setRowsPerPage] = React.useState(5);
  // const [page, setPage] = React.useState(1);

  // const handleChangePage = (event: unknown, newPage: number) => {
  //   console.log(newPage);
  //   setPage(newPage);
  // };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    setSelected(id);
    if (typeof onSelect === 'function') {
      onSelect(data.find(d => d[rowIdentifier] === id));
    }
  }
  const isSelected = (id: number) => selected === id;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {/* fixme: not really a toolbar, should it be? */}
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            {title}
          </Typography>
        </Toolbar>
        <TableContainer component={Paper}>
          <MuiTable className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
              {
                headers.map((k, idx) => {
                  return <TableCell key={idx} align='right'>{k}</TableCell>
                })
              }
              </TableRow>
            </TableHead>
            <TableBody>
              {
                data.map((obj: T, prop: number) => {
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
                )})
              }
            </TableBody>
          </MuiTable>
        </TableContainer>
        {/* <PaginationActions
          count={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={handleChangePage}
        /> */}
      </Paper>
    </div> 
  );
}