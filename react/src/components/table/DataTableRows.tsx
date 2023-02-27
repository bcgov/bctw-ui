import { Checkbox, TableCell, TableRow } from '@mui/material';
import React, { useState } from 'react';
import { formatTableCell } from './table_helpers';
import { ICustomTableColumn } from './table_interfaces';

interface DataTableRowsProps<T> {
  data: T[];
  isMultiSelect: boolean;
  headers: (keyof T)[];
  customColumns: ICustomTableColumn<T>[];
}

export function DataTableRows<T>(props: DataTableRowsProps<T>) {
  const { data, isMultiSelect, headers, customColumns } = props;
  const [selectedIndex, setSelectedIndex] = useState(null);
  return (
    <>
      {data.map((obj, idx: number) => {
        const isRowSelected = idx === selectedIndex;
        //const isRowSelected = isSelected(obj[rowIdentifier]);
        //const isRowSelected = false;
        //const highlightValidRow = showValidRecord && !formatTableCell(obj, 'valid_to').value;
        return (
          <TableRow
            hover
            onClick={() => setSelectedIndex(idx)}
            //onClick={(event): void => handleClickRow(event, obj[rowIdentifier], idx)}
            role='checkbox'
            aria-checked={isRowSelected}
            tabIndex={-1}
            key={`row${idx}`}
            selected={isRowSelected}>
            {/* render checkbox column if multiselect is enabled */}
            {isMultiSelect ? (
              <TableCell padding='checkbox'>
                <Checkbox checked={isRowSelected} />
              </TableCell>
            ) : null}
            {/* render main columns from data fetched from api */}
            {headers.map((k, i) => {
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
    </>
  );
}
