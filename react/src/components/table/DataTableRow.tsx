import { Checkbox, ClickAwayListener, TableCell, TableRow } from '@mui/material';
import { formatTableCell, isFunction } from 'components/table/table_helpers';
import { DataTableProps, ICustomTableColumn } from 'components/table/table_interfaces';
import { useTableRowSelectedDispatch } from 'contexts/TableRowSelectContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useEffect, useState } from 'react';
import { BCTWBase } from 'types/common_types';
import './table.scss';

type DataTableRowProps<T> = Pick<DataTableProps<T>, 'headers' | 'customColumns' | 'onSelect' | 'onSelectMultiple'> & {
  row: { [key in keyof T]: any };
  index: number;
  selected: boolean;
  rowIdentifier: string;
  key?: number | string;
  setSelectedRows: React.Dispatch<React.SetStateAction<T[]>>;
};

export default function DataTableRow<T extends BCTWBase<T>>(props: DataTableRowProps<T>) {
  const { headers, customColumns, selected, row, index, onSelect, onSelectMultiple, rowIdentifier, setSelectedRows } =
    props;
  const dispatchRowSelected = useTableRowSelectedDispatch();
  const [isSelectedStatus, setSelectedStatus] = useState(false);

  const isMulti = isFunction(onSelectMultiple);
  const isSingle = isFunction(onSelect);
  const isDispatch = isFunction(dispatchRowSelected);

  useDidMountEffect(() => {
    setSelectedStatus(selected);
  }, [selected]);

  useDidMountEffect(() => {
    if (isDispatch) {
      dispatchRowSelected(row[rowIdentifier]);
    }
    if (isSingle) {
      isSelectedStatus ? handleAddSingleSelect() : null;
      return;
    }
    if (isMulti) {
      handleAddRemoveMultiSelect(isSelectedStatus);
      return;
    }
  }, [isSelectedStatus]);

  const handleAddRemoveMultiSelect = (add: boolean) => {
    let rows = [];
    setSelectedRows((r) => {
      rows = r;
      if (add) {
        rows.push(row);
      } else {
        const indexOfRow = rows.indexOf(row);
        if (indexOfRow > -1) {
          rows.splice(indexOfRow, 1);
        }
      }
      return rows;
    });
    onSelectMultiple(rows);
  };

  const handleAddSingleSelect = (): void => {
    onSelect(row);
  };

  const handleClickAway = (): void => {
    if (!isMulti) {
      setSelectedStatus(false);
    }
  };

  const handleClickRow = () => {
    setSelectedStatus((s) => !s);
  };

  return (
    <ClickAwayListener onClickAway={() => handleClickAway()}>
      <TableRow tabIndex={-1} hover onClick={() => handleClickRow()} role='checkbox' selected={isSelectedStatus}>
        {isMulti ? (
          <TableCell padding='checkbox'>
            <Checkbox checked={isSelectedStatus} />
          </TableCell>
        ) : null}
        {/* render main columns from data fetched from api */}
        {headers.map((k, i) => {
          if (!k) {
            return null;
          }
          const { value } = formatTableCell(row, k);

          return (
            <TableCell key={`${String(k)}${i}`} align={'left'}>
              {value}
            </TableCell>
          );
        })}
        {customColumns?.map((c: ICustomTableColumn<T>) => {
          const Col = c.column(row, index);
          return <TableCell key={`add-col-${index}`}>{Col}</TableCell>;
        })}
      </TableRow>
    </ClickAwayListener>
  );
}
