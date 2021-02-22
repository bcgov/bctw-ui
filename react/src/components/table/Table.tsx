import React, { useEffect, useState } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  CircularProgress
} from '@material-ui/core';
import { formatTableCell, getComparator, stableSort } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import PaginationActions from './TablePaginate';
import { NotificationMessage } from 'components/common';
import { formatAxiosError } from 'utils/common';
import { ICustomTableColumn, ITableProps, Order } from './table_interfaces';
import { AxiosError } from 'axios';
import { UseQueryResult } from 'react-query';
import { BCTW } from 'types/common_types';
import { useTableRowSelectedDispatch, useTableRowSelectedState } from 'contexts/TableRowSelectContext';
import './table.scss';

export default function Table<T extends BCTW>({
  customColumns,
  headers,
  queryProps,
  title,
  onSelect,
  onSelectMultiple,
  paginate = true,
  isMultiSelect = false
}: ITableProps<T>): JSX.Element {
  const dispatchRowSelected = useTableRowSelectedDispatch();
  const useRowState = useTableRowSelectedState();
  const { query, param, onNewData, defaultSort } = queryProps;

  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [rowIdentifier, setRowIdentifier] = useState<string>('id');

  const onSuccess = (results: T[]): void => {
    const first = results[0];
    if (first && typeof first.identifier === 'string') {
      setRowIdentifier(first.identifier);
    }
    if (typeof onNewData === 'function') {
      onNewData(results);
    }
  };

  useEffect(() => {
    if (useRowState && data.length) {
      const found = data.findIndex(p => p[rowIdentifier] === useRowState);
      if (found === -1) {
        setSelected([])
      }
    }
  }, [useRowState])

  const {
    isFetching,
    isLoading,
    isError,
    error,
    data,
    isPreviousData,
    isSuccess
  }: UseQueryResult<T[], AxiosError> = query(
    page,
    param
    // { onSuccess }
    // fixme: doesnt work anymore? using useEffect on isSuccess
    // isn't triggered on new page load??
  );

  useEffect(() => {
    if (isSuccess) {
      onSuccess(data);
    }
  }, [isSuccess]);

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
        onSelectMultiple(data.filter((d) => newIds.includes(d[rowIdentifier])));
      }
      return;
    }
    setSelected([]);
  };

  const handleClickRow = (event: React.MouseEvent<unknown>, id: string): void => {
    if (isMultiSelect && typeof onSelectMultiple === 'function') {
      handleClickRowMultiEnabled(event, id)
    }
    if (typeof onSelect === 'function' && data?.length) {
      setSelected([id]);
      const row = data.find((d) => d[rowIdentifier] === id);
      onSelect(row);
    }
    // will be null unless parent component wraps RowSelectedProvider
    if (typeof dispatchRowSelected === 'function') {
      dispatchRowSelected(id);
    }
  };

  const handleClickRowMultiEnabled = (event: React.MouseEvent<unknown>, id: string): void => {
    if (typeof onSelectMultiple !== 'function') {
      return
    }
    const selectedIndex = selected.indexOf(id);
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
    // currently sending T[] not just ids
    onSelectMultiple(data.filter((d) => newSelected.includes(d[rowIdentifier])));
  }

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

  const renderNoData = (): JSX.Element => (
    <TableRow>
      <TableCell>
        {isFetching || isLoading ? (
          <CircularProgress />
        ) : isError ? (
          <NotificationMessage type='error' message={formatAxiosError(error)} />
        ) : (
          'no data available'
        )}
      </TableCell>
    </TableRow>
  );

  const renderToolbar = (): JSX.Element =>
    isMultiSelect ? (
      <TableToolbar numSelected={selected.length} title={title} />
    ) : (
      <Toolbar className={'toolbar'}>
        <Typography className={'title'} variant='h6' component='div'>
          <strong>{title}</strong>
        </Typography>
      </Toolbar>
    );

  const headerProps = headers ?? Object.keys((data && data[0]) ?? []);
  return (
    <div className={'root'}>
      <Paper className={'paper'}>
        {renderToolbar()}
        <TableContainer component={Paper}>
          <MuiTable className={'table'} size='small'>
            {data === undefined ? null : (
              <TableHead
                headersToDisplay={headerProps}
                headerData={data && data[0]}
                isMultiSelect={isMultiSelect}
                numSelected={selected.length}
                order={order}
                orderBy={(orderBy as string) ?? ''}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAll}
                rowCount={data?.length ?? 0}
                customHeaders={customColumns?.map((c) => c.header) ?? []}
              />
            )}
            <TableBody>
              {(data && data.length === 0) || isFetching || isLoading || isError
                ? renderNoData()
                : stableSort(data ?? [], getComparator(order, orderBy)).map((obj: BCTW, prop: number) => {
                  const isRowSelected = isSelected(obj[rowIdentifier]);
                  const labelId = `enhanced-table-checkbox-${prop}`;
                  return (
                    <TableRow
                      hover
                      onClick={(event): void => {
                        handleClickRow(event, obj[rowIdentifier]);
                      }}
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
                        ? customColumns.map((c: ICustomTableColumn<BCTW>) => {
                          const colComponent = c.column(obj, prop);
                          return <TableCell key={`add-col-${prop}`}>{colComponent}</TableCell>;
                        })
                        : null}
                    </TableRow>
                  );
                })}
            </TableBody>
          </MuiTable>
          {
            !paginate ||
            isLoading ||
            isFetching ||
            isError ||
            // hide pagination when total results are under page limit (10)
            (isSuccess && data?.length < 10 && paginate && page === 1)
              ? null : 
              <PaginationActions
                count={data.length}
                page={page}
                rowsPerPage={10}
                onChangePage={handlePageChange}
              />
          }
        </TableContainer>
      </Paper>
    </div>
  );
}
