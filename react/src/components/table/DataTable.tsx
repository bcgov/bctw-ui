import { mdiConsoleNetworkOutline } from '@mdi/js';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow
} from '@mui/material';
import { AxiosError } from 'axios';
import TableContainer from 'components/table/TableContainer';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import {
  formatTableCell,
  fuzzySearchMutipleWords,
  getComparator,
  isFunction,
  stableSort
} from 'components/table/table_helpers';
import { DataTableProps, ICustomTableColumn, ITableFilter, Order } from 'components/table/table_interfaces';
import {
  RowSelectedProvider,
  useTableRowSelectedDispatch,
  useTableRowSelectedState
} from 'contexts/TableRowSelectContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { BCTWBase } from 'types/common_types';
import DataTableRow from './DataTableRow';
import './table.scss';

//export const rowsPerPage = 100;
/**
 * Data table component, fetches data to display from @param {queryProps}
 * supports pagination, sorting, single or multiple selection
 */
export default function DataTable<T extends BCTWBase<T>>(props: DataTableProps<T>): JSX.Element {
  const {
    headers,
    queryProps,
    title,
    onSelect,
    onSelectMultiple,
    deleted,
    updated,
    exporter,
    resetSelections,
    disableSearch,
    requestDataByPage = false,
    paginationFooter = false,
    fullScreenHeight = false,
    alreadySelected = [],
    customColumns = [],
    forceRowRefresh = false
  } = props;
  const rowsPerPageOptions = [100, 250, 500, 1000];
  const useRowState = useTableRowSelectedState();
  const { query, param, onNewData, defaultSort } = queryProps;
  const [filter, setFilter] = useState<ITableFilter>({} as ITableFilter);
  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property);
  const [rowIdentifier, setRowIdentifier] = useState('id');
  //const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectedIDs, setSelectedIDs] = useState<boolean[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [rowsForSelectAll, setRowsForSelectAll] = useState<T[]>([]); 
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const isMultiSelect = isFunction(onSelectMultiple);

  const triggerMultiUpdate = isMultiSelect && JSON.stringify(selectedIDs);

  // fetch the data from the props query
  const { isFetching, isLoading, isError, data, isPreviousData, isSuccess }: UseQueryResult<T[], AxiosError> = query(
    requestDataByPage ? page : null,
    param,
    //filter
  );
  const noPagination = !requestDataByPage && !paginationFooter;
  const noData = isSuccess && !data?.length;

  // const [filteredRowCount, setFilteredRowCount] = useState<number>(0);
  // const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE);

  // const isPaginate = paginate && !DISABLE_PAGINATION;

  /**
   * since data is updated when the page is changed, use the 'values'
   * state to keep track of the entire set of data across pages.
   * this state is passed to the parent select handlers
   */
  const [values, setValues] = useState<T[]>([]);

  useDidMountEffect(() => {
    if (deleted) {
      handleRowDeleted(deleted);
    }
  }, [deleted]);

  const handleRows = (): void => {
    if (data?.length) {
      const rowCount = data[0]?.row_count;
      if (rowCount) {
        setTotalRows(typeof rowCount === 'string' ? parseInt(rowCount) : rowCount);
      }
    }
  };

  useEffect(() => {
    setSelectedIDs(new Array(values.length).fill(false));
  }, [resetSelections])

  useEffect(() => {
    handleRows();
    console.log('Values has changed.')
  }, [values]);

  useDidMountEffect(() => {
    if (isSuccess) {
      // update the row identifier
      const first = data && data.length && data[0];
      if (first && typeof first.identifier === 'string') {
        setRowIdentifier(first.identifier);
      }
      // update the parent handler when new data is fetched
      if (typeof onNewData === 'function') {
        onNewData(data);
      }
      const newV = [];
      /**
       * update the values state
       * note: important that the order by backend query specifies a specific order.
       * otherwise, query doesn't guarantee order, which can result in duplicates
       * across different pages / limitoffset
       */
      data.forEach((d, i) => {
        const found = values.find((v) => d[rowIdentifier] === v[rowIdentifier]);
        if (!found) {
          newV.push(d);
        }
        if (updated && d[rowIdentifier] === updated && d !== values[i]) {
          //If updated identifier is set, insert new data into array
          values[i] = d;
          setValues(values);
          handleRows();
          return;
        }
      });
      //console.log('Resetting from useDidMountEffect')
      //setSelectedIDs(new Array(data.length).fill(false));
      setValues((o) => [...o, ...newV]);
      handleRows();
      console.log('Called useDidMountEffect')
    }
  }, [data]);

  const truncateRows = (rows: T[]): T[] => {
    const start = page * rowsPerPage;
    const end = rowsPerPage * (page + 1);
    return rows.length < rowsPerPage ? rows : rows.slice(start, end);
  };

  const filterRows = (rows: T[]): T[] => {
    let results = rows.map((r,idx) => {return {...r, global_id: idx}})
    if(filter && filter.term) {
      results = fuzzySearchMutipleWords(results, filter.keys ? filter.keys : (headers as string[]), filter.term)
    }
    return results;
  }

  const displayedRows = (): T[] => {
    const results = filterRows(values);
    
     if(!requestDataByPage || noPagination)
     {
        const r = stableSort(results, getComparator(order, orderBy)) // Truncates the rows after the data is sorted (in memoRows)
        console.log('Top block len ' + r.length);
        return r;
     }
     else 
     {
        const r = stableSort(truncateRows(results), getComparator(order, orderBy)); // Truncates the rows before data is sorted
        console.log('Bottom block len ' + r.length);
        return r;
     }
      
      
  };//, [values, filter, page, rowsPerPage, order, orderBy]);

  const handleRowDeleted = (id: string): void => {
    setValues((o) => o.filter((f) => String(f[rowIdentifier]) !== id));
  };

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.checked;
    if(selected) {
      
      const updatedIds = [...selectedIDs];

      if(filter && filter.term) {
        filterRows(data).forEach((row) => {
          if (row['global_id'] < selectedIDs.length) {
            console.log(`Setting global id ${row['global_id']}`)
            updatedIds[row['global_id']] = true;
          }
        });
        console.log('set filter select all')
        setSelectedIDs(updatedIds);
      }
      else {
        console.log('set everything select all')
        setSelectedIDs(new Array(data.length).fill(true));
      }
    }
    else {
      console.log('Set selected to all false')
      setSelectedIDs(new Array(data.length).fill(false));
    }
    setSelectAll(selected);
  };

  const handlePageChange = (event: React.MouseEvent<unknown>, p: number): void => {
    setPage(p);
    //setSelectAll(false);
    //setSelectedRows([]);
    //setSelectedRows([]);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const handleFilter = (filter: ITableFilter): void => {
    setFilter(filter);
  };

  useEffect(() => {
    const selected = values.filter((f, idx) => { 
      return selectedIDs[idx] === true;
    })
    onSelectMultiple?.(selected);
    console.log('Selected IDs was called, length: ' + selected.length)
  }, [selectedIDs])

  const customColumnsAppend = customColumns?.filter((c) => !c.prepend);
  const customColumnsPrepend = customColumns?.filter((c) => c.prepend);

  const memoRows = () => {
    return (
      <>
        {(!requestDataByPage || noPagination ? truncateRows(displayedRows()) : displayedRows())?.map((obj, idx: number) => (
          <DataTableRow
            {...props}
            key={`table-row-${idx}`}
            index={obj['global_id']}
            row={obj}
            selected={selectedIDs.length ? selectedIDs[obj['global_id']] : false}
            rowIdentifier={rowIdentifier}
            setSelectedRows={(b) => {
              const copy = selectedIDs.slice();
              copy[obj['global_id']] = b;
              setSelectedIDs(copy);
            }}
            selectedRows={[]}
          />
        ))}
      </>
    );
  }//, [displayedRows, selectAll, triggerMultiUpdate, selectedIDs, forceRowRefresh]);

  return (
    <TableContainer
      fullScreenHeight={fullScreenHeight}
      toolbar={
        <TableToolbar
          rowCount={totalRows}
          title={title}
          onChangeFilter={handleFilter}
          numSelected={selectedIDs.filter(f => f === true).length}
          filterableProperties={headers}
          isMultiSearch={isMultiSelect}
          setPage={setPage}
          //showTooltip={showValidRecord}
          disableSearch={disableSearch}
          sibling={<>{exporter}</>}
        />
      }>
      <>
        <Table stickyHeader size='small'>
          <TableHead
            headersToDisplay={headers}
            headerData={data && data[0]}
            isMultiSelect={isFunction(onSelectMultiple)}
            numSelected={selectedIDs.filter(x => x === true).length}
            order={order}
            orderBy={(orderBy as string) ?? ''}
            onRequestSort={handleSort}
            onSelectAllClick={handleSelectAll}
            selectAll={selectAll}
            rowCount={values?.length ?? 0}
            customHeaders={customColumnsAppend?.map((c) => c.header) ?? []}
            customHeadersPrepend={customColumnsPrepend?.map((c) => c.header) ?? []}
          />
          <TableBody>
            {isLoading || isError ? (
              <TableRow>
                <TableCell>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : noData ? (
              <TableRow>
                <TableCell>
                  <strong>No data found...</strong>
                </TableCell>
              </TableRow>
            ) : (
              <>{memoRows()}</>
            )}
          </TableBody>
        </Table>
        {!paginationFooter || isError ? null : (
          <Box className={'table-footer'}>
            <Divider />
            <TablePagination
              showFirstButton
              rowsPerPageOptions={rowsPerPageOptions}
              component='div'
              count={totalRows}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </Box>
        )}
        {/* {isPaginate ? null : (
          <Box>
            <Divider />
            {rowsPerPage === filteredRowCount ? (
              <Button onClick={handleLoadPreview}>Display Only {ROWS_PER_PAGE} Results</Button>
            ) : (
              <Button onClick={handleLoadAll}>Display All {filteredRowCount} Results</Button>
            )}
          </Box>
        )} */}
      </>
    </TableContainer>
  );
}
