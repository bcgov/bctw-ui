import { CircularProgress, Paper, Table, TableBody, TableCell, TablePagination, TableRow } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AxiosError } from 'axios';
import TableContainer from 'components/table/TableContainer';
import TableHead from 'components/table/TableHead';
import TableToolbar from 'components/table/TableToolbar';
import { fuzzySearchMutipleWords, getComparator, isFunction, stableSort } from 'components/table/table_helpers';
import { DataTableProps, ITableFilter, Order } from 'components/table/table_interfaces';
import { useTableRowSelectedState } from 'contexts/TableRowSelectContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { BCTWBase } from 'types/common_types';
import DataTableRow from './DataTableRow';
import './table.scss';

const useStyles = makeStyles((theme) => ({
  bottomOfTableBody: {
    borderBottomRightRadius: '0px',
    borderBottomLeftRadius: '0px'
  },
  topOfTableFooter: {
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px'
  }
}));

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
    customColumns = []
  } = props;

  const styles = useStyles();

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
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const isMultiSelect = isFunction(onSelectMultiple);
  // fetch the data from the props query
  const { isFetching, isLoading, isError, data, isPreviousData, isSuccess }: UseQueryResult<T[], AxiosError> = query(
    requestDataByPage ? page : null,
    param
    //filter
  );
  const noPagination = !requestDataByPage && !paginationFooter;
  const noData = isSuccess && !data?.length;

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
  }, [resetSelections]);

  useEffect(() => {
    handleRows();
    console.log(values)
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
      setSelectedIDs(new Array(data.length).fill(false));
      setValues((o) => [...o, ...newV]);
      handleRows();
    }
  }, [data]);

  const truncateRows = (rows: T[]): T[] => {
    const start = page * rowsPerPage;
    const end = rowsPerPage * (page + 1);
    return rows.length < rowsPerPage ? rows : rows.slice(start, end);
  };

  const filterRows = (rows: T[]): T[] => {
    let results = rows.map((r, idx) => {
      const newRow = Object.assign(Object.create(Object.getPrototypeOf(r)), r);
      newRow.global_id = idx;
      return newRow;
    });
    if (filter && filter.term) {
      results = fuzzySearchMutipleWords(results, filter.keys ? filter.keys : (headers as string[]), filter.term);
    }
    return results;
  };

  const displayedRows = (): T[] => {
    const results = filterRows(values);
    let r;
    if (!requestDataByPage || noPagination) {
      r = stableSort(results, getComparator(order, orderBy)); // Truncates the rows after the data is sorted (in memoRows)
    } else {
      r = stableSort(truncateRows(results), getComparator(order, orderBy)); // Truncates the rows before data is sorted
    }
    if (r.length != totalRows) {
      //Crashes the page unless guarded by this condition for some reason.
      setTotalRows(r.length);
    }

    return r;
  }; //, [values, filter, page, rowsPerPage, order, orderBy]);

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
    if (selected) {
      const updatedIds = [...selectedIDs];

      if (filter && filter.term) {
        const r = filterRows(values);
        console.log(r);
        r.forEach((row) => {
          if (row['global_id'] < selectedIDs.length) {
            updatedIds[row['global_id']] = true;
          }
        });

        console.log('Select All Filter');
        console.log(updatedIds.filter((a) => a === true).length);
        setSelectedIDs(updatedIds);
      } else {
        setSelectedIDs(new Array(data.length).fill(true));
      }
    } else {
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
    });
    onSelectMultiple?.(selected);
  }, [selectedIDs]);

  const customColumnsAppend = customColumns?.filter((c) => !c.prepend);
  const customColumnsPrepend = customColumns?.filter((c) => c.prepend);

  const renderRows = () => {
    return (
      <>
        {(!requestDataByPage || noPagination ? truncateRows(displayedRows()) : displayedRows())?.map(
          (obj, idx: number) => (
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
          )
        )}
      </>
    );
  }; //, [displayedRows, selectAll, triggerMultiUpdate, selectedIDs, forceRowRefresh]);

  return (
    <>
      <TableContainer
        sx={{ borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' }}
        fullScreenHeight={fullScreenHeight}
        toolbar={
          <TableToolbar
            rowCount={totalRows}
            title={title}
            onChangeFilter={handleFilter}
            numSelected={selectedIDs.filter((f) => f === true).length}
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
              numSelected={selectedIDs.filter((x) => x === true).length}
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
                <>{renderRows()}</>
              )}
            </TableBody>
          </Table>

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
      {!paginationFooter || isError ? null : (
        <Paper className={styles.topOfTableFooter}>
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
        </Paper>
      )}
    </>
  );
}
