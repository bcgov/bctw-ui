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
  setSelectedRows: (s: boolean) => void;// React.Dispatch<React.SetStateAction<T[]>>;
  selectedRows: number[];
};

export default function DataTableRow<T extends BCTWBase<T>>(props: DataTableRowProps<T>) {
  const { headers, customColumns, selected, row, index, onSelect, onSelectMultiple, rowIdentifier, setSelectedRows } =
    props;
  const dispatchRowSelected = useTableRowSelectedDispatch();
  const [isSelectedStatus, setSelectedStatus] = useState(false);
  const [updateRow, setUpdateRow] = useState(false);

  const isMulti = isFunction(onSelectMultiple);
  const isSingle = isFunction(onSelect);
  const isDispatch = isFunction(dispatchRowSelected);

  const triggerUpdate = () => {
    setUpdateRow((u) => !u);
  };

  useEffect(() => {
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
    const rows = [];
    /*setSelectedRows((r) => {
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
    });*/
    //console.log('Called selectMultiple in DataTableRows')
    //onSelectMultiple(rows);
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
    console.log('Click row will set to ' + !selected);
    if(isMulti) {
      setSelectedRows(!selected);
    }
    else {
      console.log('Gonna call onSelect');
      console.log('Contents of item: ' + JSON.stringify(row))
      onSelect(row);
    }
    setSelectedStatus((s) => !s);
    
  };

  const customColumnsAppend = customColumns?.filter((c) => !c.prepend);
  const customColumnsPrepend = customColumns?.filter((c) => c.prepend);

  const mapCustomColumns = (c: ICustomTableColumn<T>[]): JSX.Element[] => {
    return c.map((c: ICustomTableColumn<T>) => {
      const Col = c.column(row, index, isSelectedStatus);
      return (
        <TableCell key={`add-col-${index}`} onClick={triggerUpdate}>
          {Col}
        </TableCell>
      );
    });
  };

  return (
    <ClickAwayListener onClickAway={() => handleClickAway()}>
      <TableRow tabIndex={-1} hover onClick={() => handleClickRow()} role='checkbox' selected={isSelectedStatus}>
        {customColumnsPrepend && mapCustomColumns(customColumnsPrepend)}
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
        {customColumnsAppend && mapCustomColumns(customColumnsAppend)}
      </TableRow>
    </ClickAwayListener>
  );
}
