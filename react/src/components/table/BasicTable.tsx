import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@material-ui/core';
import { formatTableCell, getComparator, stableSort } from 'components/table/table_helpers';
import { IPlainTableProps, Order } from 'components/table/table_interfaces';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';

/**
 * A normal, non-data table. Expects the data to be provided.
 * todo: add paginate, multiple support?
*/
export type BasicTableProps<T> = IPlainTableProps<T> & {
  data: T[];
  rowIdentifier: keyof T;
};
export default function BasicTable<T>({
  headers,
  // title,
  data,
  onSelect,
  rowIdentifier
}: BasicTableProps<T>): JSX.Element {
  const [selected, setSelected] = useState<T>();
  const headerProps = headers ?? Object.keys((data && data[0]) ?? []);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>();

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = (id): boolean => {
    return selected?.[rowIdentifier] === id;
  };

  const handleClickRow = (o: T): void => {
    setSelected(o);
    if (typeof onSelect === 'function' && data?.length) {
      onSelect(o);
    }
  };

  return (
    <div className={'root'}>
      <Paper className={'paper'}>
        {/* {renderToolbar()} */}
        <TableContainer component={Paper}>
          <Table className={'table'} size='small'>
            {data === undefined ? null : (
              <TableHead
                headersToDisplay={headerProps}
                headerData={data && data[0]}
                isMultiSelect={false}
                numSelected={selected ? 1 : 0}
                order={order}
                orderBy={(orderBy as string) ?? ''}
                onRequestSort={handleSort}
                onSelectAllClick={null}
                rowCount={data?.length ?? 0}
                customHeaders={undefined}
              />
            )}
            <TableBody>
              {stableSort(data, getComparator(order, orderBy)).map((obj: T, prop: number) => {
                const isRowSelected = isSelected(obj);
                return (
                  <TableRow
                    hover
                    onClick={(): void => {
                      handleClickRow(obj);
                    }}
                    role='checkbox'
                    aria-checked={isRowSelected}
                    tabIndex={-1}
                    key={`row${prop}`}
                    selected={isRowSelected}>
                    {headerProps.map((k: string, i: number) => {
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
