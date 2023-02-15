import {
  Box,
  Checkbox,
  CircularProgress,
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
import { formatTableCell, fuzzySearchMutipleWords, getComparator, stableSort } from 'components/table/table_helpers';
import { DataTableProps, ICustomTableColumn, ITableFilter, Order } from 'components/table/table_interfaces';
import { useTableRowSelectedDispatch, useTableRowSelectedState } from 'contexts/TableRowSelectContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { BCTWBase } from 'types/common_types';
import './table.scss';

export const ROWS_PER_PAGE = 100;
/**
 * Data table component, fetches data to display from @param {queryProps}
 * supports pagination, sorting, single or multiple selection
 */
export default function DataTable<T extends BCTWBase<T>>({
  customColumns = [],
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
  isMultiSelect = false,
  isMultiSearch = false,
  alreadySelected = [],
  showValidRecord = false
}: DataTableProps<T>): JSX.Element {
  const dispatchRowSelected = useTableRowSelectedDispatch();
  const useRowState = useTableRowSelectedState();
  const { query, param, onNewData, defaultSort } = queryProps;
  const [filter, setFilter] = useState<ITableFilter>({} as ITableFilter);
  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property);
  const [selected, setSelected] = useState<string[]>(alreadySelected);
  const [rowIdentifier, setRowIdentifier] = useState('id');

  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState<number>(0);

  /**
   * since data is updated when the page is changed, use the 'values'
   * state to keep track of the entire set of data across pages.
   * this state is passed to the parent select handlers
   */
  const [values, setValues] = useState<T[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [resetSelections]);

  // if a row is selected in a different table, unselect all rows in this table
  useDidMountEffect(() => {
    if (useRowState && data?.length) {
      const found = data.findIndex((p) => p[rowIdentifier] === useRowState);
      if (found === -1) {
        setSelected([]);
      }
    }
  }, [useRowState]);

  useDidMountEffect(() => {
    if (deleted) {
      handleRowDeleted(deleted);
    }
  }, [deleted]);

  // fetch the data from the props query
  const { isFetching, isLoading, isError, data, isPreviousData, isSuccess }: UseQueryResult<T[], AxiosError> = query(
    requestDataByPage ? page : null,
    param,
    filter
  );

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
        }
      });
      //queryPage === 1 && setQueryPage(0);
      setValues((o) => [...o, ...newV]);
    }
  }, [data]);

  const handleRowDeleted = (id: string): void => {
    setValues((o) => o.filter((f) => String(f[rowIdentifier]) !== id));
  };

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const handlerExists = typeof onSelectMultiple === 'function';
    if (event.target.checked && selected.length === 0) {
      //const newIds = data.map((r) => r[rowIdentifier]);
      //Select by the page not by initial data.
      const newIds = perPage().map((r) => r[rowIdentifier]);
      setSelected(newIds);
      if (handlerExists) {
        const multi = values.filter((d) => newIds.includes(d[rowIdentifier]));
        onSelectMultiple(multi);
      }
    } else {
      if (handlerExists) {
        onSelectMultiple([]);
      }
      setSelected([]);
    }
  };

  const handleClickRow = (event: React.MouseEvent<unknown>, id: string, idx: number): void => {
    if (isMultiSelect && typeof onSelectMultiple === 'function') {
      handleClickRowMultiEnabled(event, id);
    }
    if (typeof onSelect === 'function' && data?.length) {
      setSelected([id]);
      // a row can only be selected from the current pages data set
      // fixme: why ^?
      const i = values.findIndex((v) => v[rowIdentifier] === id);
      const row = values[i];
      if (row) {
        onSelect(row);
      }
      // onSelect(selected.indexOf(id))
    }
    // will be null unless parent component wraps RowSelectedProvider
    if (typeof dispatchRowSelected === 'function') {
      dispatchRowSelected(id);
    }
  };

  const handleClickRowMultiEnabled = (event: React.MouseEvent<unknown>, id: string): void => {
    if (typeof onSelectMultiple !== 'function') {
      return;
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
    if (alreadySelected.length) {
      onSelectMultiple(newSelected);
    } else {
      // send T[] not just the identifiers
      onSelectMultiple(values.filter((d) => newSelected.includes(d[rowIdentifier])));
    }
  };

  const isSelected = (id: string): boolean => {
    const checkIsSelected = selected.indexOf(id) !== -1;
    return checkIsSelected;
  };

  const handlePageChange = (event: React.MouseEvent<unknown>, p: number): void => {
    // TablePagination is zero index. Adding 1 fixes second page results from not refreshing.
    console.log(p);
    setPage(p);
  };

  const handleFilter = (filter: ITableFilter): void => {
    setFilter(filter);
  };

  const Toolbar = (): JSX.Element => (
    <TableToolbar
      rowCount={totalRows}
      numSelected={isMultiSelect ? selected.length : 0}
      title={title}
      onChangeFilter={handleFilter}
      filterableProperties={headers}
      isMultiSearch={isMultiSearch}
      setPage={setPage}
      showTooltip={showValidRecord}
      disableSearch={disableSearch}
      //disabled={totalPages !== 1}
      sibling={<>{exporter}</>}
    />
  );

  // todo: why using memo for this?
  const headerProps = useMemo(() => headers, []);
  // fixme: fix excesssive rerenders
  // const customCols = customColumns.map((cc,idx) => {
  //   return (obj: T) => useMemo(() => cc.column(obj, idx), [obj]);
  // })

  // called in the render function
  // determines which values to render, based on page and filters applied
  const perPage = (): T[] => {
    const results =
      filter && filter.term
        ? fuzzySearchMutipleWords(values, filter.keys ? filter.keys : (headerProps as string[]), filter.term)
        : values;
    const start = (ROWS_PER_PAGE + page - ROWS_PER_PAGE - 1) * ROWS_PER_PAGE;
    const end = ROWS_PER_PAGE * page - 1;
    // console.log(`slice start ${start}, slice end ${end}`);
    return results.length > ROWS_PER_PAGE ? results.slice(start, end) : results;
  };

  const TableContents = (): JSX.Element => {
    const noData = isSuccess && !data?.length;
    if (isLoading || isError) {
      return (
        <TableBody>
          <TableRow>
            <TableCell>
              <CircularProgress />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    if (noData) {
      return (
        <TableBody>
          <TableRow>
            <TableCell>
              <strong>No data found...</strong>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
    const sortedResults = stableSort(perPage(), getComparator(order, orderBy));
    return (
      <TableBody>
        {sortedResults.map((obj, idx: number) => {
          const isRowSelected = isSelected(obj[rowIdentifier]);
          const highlightValidRow = showValidRecord && !formatTableCell(obj, 'valid_to').value;
          return (
            <TableRow
              hover
              onClick={(event): void => handleClickRow(event, obj[rowIdentifier], idx)}
              role='checkbox'
              aria-checked={isRowSelected}
              tabIndex={-1}
              key={`row${idx}`}
              selected={isRowSelected || highlightValidRow}>
              {/* render checkbox column if multiselect is enabled */}
              {isMultiSelect ? (
                <TableCell padding='checkbox'>
                  <Checkbox checked={isRowSelected} />
                </TableCell>
              ) : null}
              {/* render main columns from data fetched from api */}
              {headerProps.map((k, i) => {
                if (!k) {
                  return null;
                }
                const { value } = formatTableCell(obj, k);

                return (
                  <TableCell key={`${String(k)}${i}`} align={'left'}>
                    {value}
                  </TableCell>
                );
              })}
              {/* render additional columns from props */}
              {customColumns.map((c: ICustomTableColumn<T>) => {
                const Col = c.column(obj, idx);
                return <TableCell key={`add-col-${idx}`}>{Col}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    );
  };
  return (
    <TableContainer toolbar={Toolbar()}>
      <>
        <Table stickyHeader size='small'>
          <TableHead
            headersToDisplay={headerProps}
            headerData={data && data[0]}
            isMultiSelect={isMultiSelect}
            numSelected={selected.length}
            order={order}
            orderBy={(orderBy as string) ?? ''}
            onRequestSort={handleSort}
            onSelectAllClick={handleSelectAll}
            rowCount={values?.length ?? 0}
            customHeaders={customColumns?.map((c) => c.header) ?? []}
          />
          <TableContents />
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
