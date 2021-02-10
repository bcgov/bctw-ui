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
import { formatTableCell, getComparator, stableSort } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import PaginationActions from './TablePaginate';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { NotificationMessage } from 'components/common';
import { formatAxiosError, getProperty } from 'utils/common';
import { ICustomTableColumn, ITableProps, Order } from './table_interfaces';

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

export default function Table<T>({
  customColumns,
  headers,
  queryProps,
  title,
  onSelect,
  onSelectMultiple,
  paginate = true,
  rowIdentifier = 'id' as any,
  isMultiSelect = false
}: ITableProps<T>): JSX.Element {
  const classes = useStyles();
  const { query, queryParam, onNewData, defaultSort } = queryProps;

  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property ?? (rowIdentifier as any));
  const [selected, setSelected] = useState<string[]>([]);
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
  } = (bctwApi[query] as any)(page, queryParam, { onSuccess: typeof onNewData === 'function' ? onNewData : null });

  const data = pageData ?? unpaginatedData;

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event): void => {
    if (event.target.checked) {
      const newIds = data.map((r) => r[rowIdentifier]);
      setSelected(newIds);
      if (typeof onSelectMultiple === 'function') {
        // onSelectMultiple(newIds);
        onSelectMultiple(data.filter((d) => newIds.includes(d[rowIdentifier])));
      }
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string): void => {
    const selectedIndex = selected.indexOf(id);
    if (!isMultiSelect) {
      setSelected([id]);
      if (typeof onSelect === 'function') {
        const row = data?.find((d) => d[rowIdentifier] === id);
        onSelect(row);
      }
      return;
    }
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
    if (typeof onSelectMultiple === 'function') {
      // currently sending T[] not just ids
      onSelectMultiple(data.filter((d) => newSelected.includes(d[rowIdentifier])));
    }
  };

  const isSelected = (id: string): boolean => {
    return selected.indexOf(id) !== -1;
  };

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
    <TableRow>
      <TableCell>loading...</TableCell>
    </TableRow>
  );
  const renderError = (): JSX.Element => (
    <TableRow>
      <TableCell>
        <NotificationMessage type='error' message={formatAxiosError(error)} />
      </TableCell>
    </TableRow>
  );

  const renderNoData = (): JSX.Element => (
    <TableRow>
      <TableCell>no data available</TableCell>
    </TableRow>
  )

  const renderToolbar = (): JSX.Element =>
    isMultiSelect ? (
      <TableToolbar numSelected={selected.length} title={title} />
    ) : (
      <Toolbar className={classes.toolbar}>
        <Typography className={classes.title} variant='h6' component='div'>
          <strong>{title}</strong>
        </Typography>
      </Toolbar>
    );

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
                customHeaders={customColumns?.map(c => c.header) ?? []}
              />
            )}
            <TableBody>
              {data && data.length === 0 ? (
                renderNoData()
              ) : isFetching || isLoading ? (
                renderFetching()
              ) : isError ? (
                renderError()
              ) : (
                stableSort(data ?? [], getComparator(order, orderBy)).map((obj: T, prop: number) => {
                  const isRowSelected = isSelected(getProperty(obj, rowIdentifier) as string);
                  const labelId = `enhanced-table-checkbox-${prop}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event): void => handleClick(event, getProperty(obj, rowIdentifier) as string)}
                      role='checkbox'
                      aria-checked={isRowSelected}
                      tabIndex={-1}
                      key={`row${prop}`}
                      selected={isRowSelected}>
                      {/* render checkbox column if multiselect is enabled */}
                      {isMultiSelect ? (
                        <TableCell padding='checkbox'>
                          <Checkbox checked={isRowSelected} inputProps={{ 'aria-labelledby': labelId }} />
                        </TableCell>
                      ) : null}
                      {/* render main columns from data fetched from api */}
                      {headerProps.map((k: string, i: number) => {
                        if (!k) {
                          return null;
                        }
                        const { align, value } = formatTableCell(obj, k);
                        return (
                          <TableCell key={`${k}${i}`} align={align}>
                            {value}
                          </TableCell>
                        );
                      })}
                      {/* render additional columns from props */}
                      {customColumns
                        ? customColumns.map((c: ICustomTableColumn<T>) => {
                          const colComponent = c.column(obj, prop);
                          return <TableCell key={`add-col-${prop}`}>{colComponent}</TableCell>;
                        })
                        : null}
                    </TableRow>
                  );
                })
              )}
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
