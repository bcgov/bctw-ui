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
  Paper,
  Checkbox
} from '@material-ui/core';
import { getComparator, Order, stableSort } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import { dateObjectToTimeStr } from 'utils/time';
import PaginationActions from './TablePaginate';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { NotificationMessage } from 'components/common';
import { formatAxiosError, getProperty } from 'utils/common';
import { ITableQueryProps } from 'api/api_interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%'
    },
    table: {
      minWidth: 650
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2)
    },
    toolbar: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      color: theme.palette.text.primary
    },
    title: {
      flex: '1 1 100%'
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
      width: 1
    }
  })
);

type ITableProps<T> = {
  headers?: string[];
  rowIdentifier?: keyof T;
  title?: string;
  queryProps: ITableQueryProps<T>;
  paginate?: boolean;
  renderIfNoData?: boolean;
  onSelect?: (row: T) => void;
  onSelectMultiple?: (rows: T[]) => void;
  isMultiSelect?: boolean;
};

/**
 *
 * @param headers assuming not all data properties are displayed in the table. * required
 * @param rowIdentifier what uniquely identifies a row (ex device_id for a collar). defaults to 'id'
 * @param title table title
 * @param onSelect handler from parent triggered when a row is clicked
 * @param renderIfNoData hide the table if no data found?
 * @param paginate should the pagination actions be displayed?
 * @param isMultiSelect render row of checkboxes and different toolbar - default to false
 */
export default function Table<T>({
  headers,
  queryProps,
  title,
  onSelect,
  onSelectMultiple,
  paginate = true,
  rowIdentifier = 'id' as any,
  renderIfNoData = true,
  isMultiSelect = false
}: ITableProps<T>): JSX.Element {
  const classes = useStyles();
  const { query, queryParam: queryProp, onNewData, defaultSort } = queryProps;

  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property ?? (rowIdentifier as any));
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState<number>(1);
  const bctwApi = useTelemetryApi();

  const {
    isFetching,
    isLoading,
    isError,
    error,
    data: unpaginatedData,
    resolvedData: pageData,
    isPreviousData
  } = (bctwApi[query] as any)(page, queryProp, { onSuccess: typeof onNewData === 'function' ? onNewData : null });

  const data = pageData ?? unpaginatedData;

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event): void => {
    if (event.target.checked) {
      const newIds = data.map(r => r[rowIdentifier]);
      setSelected(newIds);
      return;
    }
    setSelected([]);
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: number): void => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);

    const row = data?.find((d) => d[rowIdentifier] === id);
    if (typeof onSelect === 'function') {
      onSelect(row);
    } else if (typeof onSelectMultiple === 'function') {
      const filtered = data.filter(d => {
        return newSelected.includes(d[rowIdentifier]);
      })
      onSelectMultiple(filtered);
    }
  };

  const isSelected = (id: number): boolean => selected.indexOf(id) !== -1;

  const handlePageChange = (event: React.MouseEvent<unknown>, page: number): void => {
    const currentPage = page;
    if (page > currentPage) {
      if (!isPreviousData) {
        setPage(page);
        return;
      }
    }
    setPage(page);
  };

  const renderFetching = (): JSX.Element => (
    <TableRow><TableCell>loading...</TableCell></TableRow>
  );
  const renderError = (): JSX.Element => (
    <TableRow>
      <TableCell>
        <NotificationMessage type='error' message={formatAxiosError(error)} />
      </TableCell>
    </TableRow>
  );

  const renderToolbar = (): JSX.Element => (
    isMultiSelect ? (
      <TableToolbar numSelected={selected.length} title={title} />
    ) : (
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.title} variant='h6' component='div'>
          <strong>{title}</strong>
        </Typography>
      </Toolbar>
    )
  )

  if (data && data.length === 0 && !renderIfNoData) {
    return null;
  }
  const headerProps = headers ?? Object.keys((data && data[0]) ?? []);
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {renderToolbar()}
        <TableContainer component={Paper}>
          <MuiTable className={classes.table} size='small'>
            {isFetching || isLoading || isError ? null : (
              <TableHead
                headersToDisplay={headerProps}
                headerData={data && data.length ? data[0] : []}
                isMultiSelect={isMultiSelect}
                numSelected={selected.length}
                order={order}
                orderBy={(orderBy as string) ?? ''}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAll}
                rowCount={data?.length ?? 0}
              />
            )}
            <TableBody>
              {isFetching || isLoading
                ? renderFetching()
                : isError
                  ? renderError()
                  : stableSort(data ?? [], getComparator(order, orderBy)).map((obj: T, prop: number) => {
                    const isRowSelected = isSelected(getProperty(obj, rowIdentifier) as number);
                    const labelId = `enhanced-table-checkbox-${prop}`;
                    return (
                      <TableRow
                        hover
                        onClick={(event): void => handleClick(event, getProperty(obj, rowIdentifier) as number)}
                        role='checkbox'
                        aria-checked={isRowSelected}
                        tabIndex={-1}
                        key={prop}
                        selected={isRowSelected}
                      >
                        { isMultiSelect ? (
                          <TableCell padding='checkbox'>
                            <Checkbox
                              checked={isRowSelected}
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </TableCell>
                        ) : null}
                        {headerProps.map((k: string, i: number) => {
                          if (!k) {
                            return null;
                          }
                          let val = obj[k];
                          if (typeof val?.getMonth === 'function') {
                            val = dateObjectToTimeStr(val);
                          }
                          return (
                            <TableCell key={`${k}${i}`} align='right'>
                              {val}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
            </TableBody>
          </MuiTable>
          {!paginate || isLoading || isFetching || isError ? null : (
            <PaginationActions count={data.length} page={page} rowsPerPage={10} onChangePage={handlePageChange} />
          )}
        </TableContainer>
      </Paper>
    </div>
  );
}
