import { mdiConsoleNetworkOutline } from '@mdi/js';
import {
  Box,
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
import { memo, useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { BCTWBase } from 'types/common_types';
import DataTableRow from './DataTableRow';
import './table.scss';

export const ROWS_PER_PAGE = 100;
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
    paginationFooter = true,
    isMultiSearch = false,
    showValidRecord = false,
    alreadySelected = [],
    customColumns = []
  } = props;
  const useRowState = useTableRowSelectedState();
  const { query, param, onNewData, defaultSort } = queryProps;
  const [filter, setFilter] = useState<ITableFilter>({} as ITableFilter);
  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property);
  //const [selected, setSelected] = useState<string[]>(alreadySelected);
  const [rowIdentifier, setRowIdentifier] = useState('id');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState<number>(0);
  //console.log(`table: ${selectedRows.length}`);

  useEffect(() => {
    console.log(`table: ${selectedRows.length}`);
  }, [JSON.stringify(selectedRows)]);

  // fetch the data from the props query
  const { isFetching, isLoading, isError, data, isPreviousData, isSuccess }: UseQueryResult<T[], AxiosError> = query(
    requestDataByPage ? page : null,
    param,
    filter
  );
  const noPagination = !requestDataByPage && !paginationFooter;
  const noData = isSuccess && !data?.length;

  /**
   * since data is updated when the page is changed, use the 'values'
   * state to keep track of the entire set of data across pages.
   * this state is passed to the parent select handlers
   */
  const [values, setValues] = useState<T[]>([]);

  // useEffect(() => {
  //   setSelected([]);
  // }, [resetSelections]);

  // if a row is selected in a different table, unselect all rows in this table
  useDidMountEffect(() => {
    if (useRowState && data?.length) {
      const found = data.findIndex((p) => p[rowIdentifier] === useRowState);
      if (found === -1) {
        //setSelected([]);
      }
    }
  }, [useRowState]);

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
    handleRows();
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
      setValues((o) => [...o, ...newV]);
      handleRows();
    }
  }, [data]);

  const perPage = useMemo((): T[] => {
    console.log('perPage called');
    const results =
      filter && filter.term
        ? fuzzySearchMutipleWords(values, filter.keys ? filter.keys : (headers as string[]), filter.term)
        : values;
    const start = (ROWS_PER_PAGE + page - ROWS_PER_PAGE - 1) * ROWS_PER_PAGE;
    const end = ROWS_PER_PAGE * page - 1;

    if (noPagination) {
      return results;
    }
    return results.length > ROWS_PER_PAGE ? results.slice(start, end) : results;
  }, [values, filter, page]);

  const handleRowDeleted = (id: string): void => {
    setValues((o) => o.filter((f) => String(f[rowIdentifier]) !== id));
  };

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(event.target.checked);
    //setSelectedIndexes(perPage.map((r, i) => i));
  };

  const handlePageChange = (event: React.MouseEvent<unknown>, p: number): void => {
    // TablePagination is zero index. Adding 1 fixes second page results from not refreshing.
    setPage(p);
    setSelectAll(false);
  };

  const handleFilter = (filter: ITableFilter): void => {
    setFilter(filter);
  };

  const memoRows = useMemo(() => {
    return (
      <>
        {stableSort(perPage, getComparator(order, orderBy))?.map((obj, idx: number) => (
          <DataTableRow
            {...props}
            key={`table-row-${idx}`}
            index={idx}
            row={obj}
            selected={selectAll || (showValidRecord && !formatTableCell(obj, 'valid_to').value)}
            rowIdentifier={rowIdentifier}
            setSelectedRows={setSelectedRows}
          />
        ))}
      </>
    );
  }, [perPage, selectAll]);

  return (
    <TableContainer
      toolbar={
        <TableToolbar
          rowCount={totalRows}
          title={title}
          onChangeFilter={handleFilter}
          numSelected={selectedRows.length}
          filterableProperties={headers}
          isMultiSearch={isMultiSearch}
          setPage={setPage}
          showTooltip={showValidRecord}
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
            numSelected={selectedRows.length}
            order={order}
            orderBy={(orderBy as string) ?? ''}
            onRequestSort={handleSort}
            onSelectAllClick={handleSelectAll}
            selectAll={selectAll}
            rowCount={values?.length ?? 0}
            customHeaders={customColumns?.map((c) => c.header) ?? []}
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
              <>{memoRows}</>
            )}
          </TableBody>
        </Table>
        {!paginationFooter || isError || values.length < ROWS_PER_PAGE ? null : (
          <Box className={'table-footer'}>
            <Divider />
            <TablePagination
              showFirstButton
              rowsPerPageOptions={[]}
              component='div'
              count={totalRows}
              rowsPerPage={ROWS_PER_PAGE}
              page={page}
              onPageChange={handlePageChange}
            />
          </Box>
        )}
      </>
    </TableContainer>
  );
}
