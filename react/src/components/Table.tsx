import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { createStyles, Table as MuiTable, TablePagination, Theme, Toolbar, Typography } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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

type ITableProps = {
  data: object[];
  headers: string[];
  title?: string;
}

export default function Table({data, title, headers}: ITableProps) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState<number>(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    setSelected(id);
  }
  const isSelected = (id: number) => selected === id;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
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
              {data.map((obj: object, prop: number) => {
                const isRowSelected = isSelected((obj as any).id)
                return (
                  <TableRow
                    key={prop}
                    selected={isRowSelected}
                    onClick={(event) => handleClick(event, (obj as any).id)}
                  >
                  {
                    headers.map((k: string, i: number) => {
                      return <TableCell key={`${k}${i}`} align='right'>{obj[k]}</TableCell>
                    })
                  }
                  </TableRow>
              )})}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div> 
  );
}