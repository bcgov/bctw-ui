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
import { dateObjectToTimeStr } from 'utils/time';
import PaginationActions from './TablePaginate';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { NotificationMessage } from 'components/common';
import { formatAxiosError } from 'utils/common';
import { ITableQueryProps } from 'api/api_interfaces';

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
  headers: string[];
  rowIdentifier?: string;
  title?: string;
  queryProps: ITableQueryProps<T>;
  paginate?: boolean;
  renderIfNoData?: boolean;
  onSelect?: (row: T) => void;
}

/**
 * 
 * @param headers assuming not all data properties are displayed in the table. * required
 * @param rowIdentifier what uniquely identifies a row (ex device_id for a collar). defaults to 'id'
 * @param title table title
 * @param onSelect handler from parent triggered when a row is clicked
 * @param renderIfNoData hide the table if no data found?
 * @param paginate should the pagination actions be displayed?
 */
export default function Table<T>({ headers, queryProps, title, onSelect, paginate = true, rowIdentifier = 'id', renderIfNoData = true }: ITableProps<T>): JSX.Element {
  const classes = useStyles();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(rowIdentifier as any);
  const [selected, setSelected] = useState<number>(null);
  const [page, setPage] = useState<number>(1);
  const bctwApi = useTelemetryApi();

  const { query, queryParam: queryProp, onNewData } = queryProps;
  const { isFetching, isLoading, isError, error, resolvedData: data, isPreviousData } =
    (bctwApi[query] as any)(page, queryProp, { onSuccess: typeof onNewData === 'function' ? onNewData : null });

  const onSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const onClick = (event: React.MouseEvent<unknown>, id: number): void => {
    setSelected(id);
    const row = data?.find(d => d[rowIdentifier] === id);
    if (typeof onSelect === 'function') {
      onSelect(row);
    }
  }
  const isSelected = (id: number): boolean => selected === id;

  const onPageChange = (event: React.MouseEvent<unknown>, page: number): void => {
    const currentPage = page;
    if (page > currentPage) {
      if (!isPreviousData) {
        setPage(page);
        return;
      }
    }
    setPage(page);
  }

  const renderFetch = (): JSX.Element => <TableRow><TableCell>loading...</TableCell></TableRow>;
  const renderError = (): JSX.Element => <TableRow><TableCell><NotificationMessage type='error' message={formatAxiosError(error)} /></TableCell></TableRow>;

  if ((data && data.length === 0) && !renderIfNoData) {
    return null;
  }
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {title ?
          <Toolbar className={classes.toolbar}>
            <Typography className={classes.title} variant="h6" component="div">
              <strong>{title}</strong>
            </Typography>
          </Toolbar> : null
        }
        <TableContainer component={Paper}>
          <MuiTable className={classes.table} size="small">
            {
              isFetching || isLoading || isError ? null
                :
                <TableHead
                  headersToDisplay={headers}
                  headerData={data && data.length ? data[0] : []}
                  order={order}
                  orderBy={orderBy as string ?? ''}
                  onRequestSort={onSort}
                />
            }
            <TableBody>
              {
                isFetching || isLoading ? renderFetch()
                  : isError ? renderError()
                    :
                    stableSort(data ?? [], getComparator(order, orderBy))
                      .map((obj: T, prop: number) => {
                        const isRowSelected = isSelected(obj[rowIdentifier])
                        return (
                          <TableRow
                            key={prop}
                            selected={isRowSelected}
                            onClick={(event): void => onClick(event, obj[rowIdentifier])}
                          >
                            {
                              headers.map((k: string, i: number) => {
                                let val = obj[k];
                                if (typeof (val)?.getMonth === 'function') {
                                  val = dateObjectToTimeStr(val);
                                }
                                return <TableCell key={`${k}${i}`} align='right'>{val}</TableCell>
                              })
                            }
                          </TableRow>
                        )
                      })
              }
            </TableBody>
          </MuiTable>
          {
            !paginate || isLoading || isFetching || isError ? null :
              <PaginationActions count={data.length} page={page} rowsPerPage={10} onChangePage={onPageChange} />
          }
        </TableContainer>
      </Paper>
    </div>
  );
}