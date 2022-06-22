import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableRow, Checkbox, CircularProgress } from '@mui/material';
import TableContainer from 'components/table/TableContainer';
import { formatTableCell, fuzzySearchMutipleWords, getComparator, stableSort } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import PaginationActions from 'components/table/TablePaginate';
import { ICustomTableColumn, ITableFilter, DataTableProps, Order } from 'components/table/table_interfaces';
import { AxiosError } from 'axios';
import { UseQueryResult } from 'react-query';
import { BCTWBase } from 'types/common_types';
import { useTableRowSelectedDispatch, useTableRowSelectedState } from 'contexts/TableRowSelectContext';
import './table.scss';
import useDidMountEffect from 'hooks/useDidMountEffect';

// note: const override for disabling pagination
const DISABLE_PAGINATION = false;
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
  paginate = true,
  isMultiSelect = false,
  isMultiSearch = false,
  alreadySelected = []
}: DataTableProps<T>): JSX.Element {
  const dispatchRowSelected = useTableRowSelectedDispatch();
  const useRowState = useTableRowSelectedState();
  const { query, param, onNewData, defaultSort } = queryProps;
  const [filter, setFilter] = useState<ITableFilter>({} as ITableFilter);
  const [order, setOrder] = useState<Order>(defaultSort?.order ?? 'asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultSort?.property);
  const [selected, setSelected] = useState<string[]>(alreadySelected);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [rowIdentifier, setRowIdentifier] = useState('id');
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [displayPagination, setDisplayPagination] = useState<boolean>(false);
  const isPaginate = paginate && !DISABLE_PAGINATION;
  /**
   * since data is updated when the page is changed, use the 'values'
   * state to keep track of the entire set of data across pages.
   * this state is passed to the parent select handlers
   */
  const [values, setValues] = useState<T[]>([]);

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
  const { isFetching, isLoading, isError, data, isPreviousData, isSuccess }: UseQueryResult<T[], AxiosError> =
    query(page, param, filter);

  useDidMountEffect(() => {
    if (isSuccess) {
      //Only set total pages on inital load
      const rowCount = data[0]?.row_count;
      if (rowCount) {
        const getPageCount = rowCount ? Math.ceil(rowCount / rowsPerPage) : -1;
        if (getPageCount !== totalPages && getPageCount !== -1) {
          setTotalPages(getPageCount);
        }
        if(!displayPagination){
          setDisplayPagination(true);
        }
        if (!totalRows) {
          setTotalRows(rowCount);
        }
      }

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
      data.forEach((d) => {
        const found = values.find((v) => d[rowIdentifier] === v[rowIdentifier]);
        if (!found) {
          newV.push(d);
        }
      });
      setValues((o) => [...o, ...newV]);
      setRowsPerPage((o) => (isPaginate ? o : data.length));
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

  const handleClickRow = (event: React.MouseEvent<unknown>, id: string): void => {
    if (isMultiSelect && typeof onSelectMultiple === 'function') {
      handleClickRowMultiEnabled(event, id);
    }
    if (typeof onSelect === 'function' && data?.length) {
      setSelected([id]);
      // a row can only be selected from the current pages data set
      // fixme: why ^?
      const row = values.find((d) => d[rowIdentifier] === id);
      if (row) {
        onSelect(row);
      }
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

  const handleFilter = (filter: ITableFilter): void => {
    setFilter(filter);
  };

  const Toolbar = (): JSX.Element => (
    <TableToolbar
      rowCount={totalRows}
      numSelected={selected.length}
      title={title}
      onChangeFilter={handleFilter}
      filterableProperties={headers}
      isMultiSearch={isMultiSearch}
      setPage={setPage}
      sibling={
        /**
         * hide pagination when total results are under @var rowsPerPage
         * possible that only 10 results are actually available, in which
         * case the next page will load no new results
         * 
         * DEPRECIATED -> workflow was jarring / dissorientating as pagination was conditionally rendered
         * 
         */
        // !isPaginate || isError || (isSuccess && data?.length < rowsPerPage && paginate && page === 1)
        !isPaginate || isError || !displayPagination ? null : (
          <PaginationActions
            count={!isFetching && data.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={handlePageChange}
            totalPages={totalPages}
          />
        )
      }
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
    const start = (rowsPerPage + page - rowsPerPage - 1) * rowsPerPage;
    const end = rowsPerPage * page - 1;
    // console.log(`slice start ${start}, slice end ${end}`);
    return results.length > rowsPerPage ? results.slice(start, end) : results;
  };

  const TableContents = (): JSX.Element => {

    if (isLoading || isError) {
      return <CircularProgress />;
    }
    if (isSuccess && !data?.length) {
      setTotalPages(1);
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
    if (isSuccess) {
      return (
        <TableBody>
          {stableSort(perPage(), getComparator(order, orderBy)).map((obj, prop: number) => {
            const isRowSelected = isSelected(obj[rowIdentifier]);
            return (
              <TableRow
                hover
                onClick={(event): void => handleClickRow(event, obj[rowIdentifier])}
                role='checkbox'
                aria-checked={isRowSelected}
                tabIndex={-1}
                key={`row${prop}`}
                selected={isRowSelected}>
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
                    <TableCell key={`${k}${i}`} align={'left'}>
                      {value}
                    </TableCell>
                  );
                })}
                {/* render additional columns from props */}
                {customColumns.map((c: ICustomTableColumn<T>) => {
                  const Col = c.column(obj, prop);
                  return <TableCell key={`add-col-${prop}`}>{Col}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      );
    }
    return null;
  };
  return (
    <TableContainer toolbar={Toolbar()}>
      <Table stickyHeader>
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
            rowCount={values?.length ?? 0}
            customHeaders={customColumns?.map((c) => c.header) ?? []}
          />
        )}
        <TableContents />
      </Table>
    </TableContainer>
  );
}
