import { Box, Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Button, Icon } from 'components/common';
import { PlainTableProps } from 'components/table/table_interfaces';
import TableContainer from './TableContainer';
import './table.scss';
import React from 'react';

export type EditTableRowAction = 'add' | 'delete' | 'duplicate' | 'edit' | 'reset';

export type EditTableVisibilityProps = {
  hideAll?: boolean;
  hideAdd?: boolean;
  hideDuplicate?: boolean;
  hideDelete?: boolean;
  hideEdit?: boolean;
  hideSave?: boolean;
  showReset?: boolean;
};

type EditTableProps<T> = Omit<PlainTableProps<T>, 'headers'> & EditTableVisibilityProps & {
  canSave: boolean;
  columns: ((d: T) => JSX.Element)[];
  data: T[];
  headers: string[];
  onRowModified: (n: T, action: EditTableRowAction) => void;
  onSave: () => void;
  onSelectMultiple?: (n: T[]) => void;
  saveButtonText?: string;
  isMultiSelect?: boolean;
  //selected: number[];
  //numSelected?: number;
  //onCheckAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * @param columns - array of functions that return a component (rendered before the editing buttons)
 * @param canSave - is the save button enabled
 * @param data - the table data - when @param columns are rendered, the data row at the current row index is passed
 * to the column renderer function as a prop
 * @param onRowModified - call parent handler with the row clicked and @type {EditTableRowAction}
 * @param onSave - calls parent handler when save button clicked
 */
export default function EditTable<T>(props: EditTableProps<T>): JSX.Element {
  const {
    canSave,
    headers,
    hideSave,
    data,
    onRowModified,
    onSave,
    columns,
    hideAdd,
    hideAll,
    hideDuplicate,
    hideDelete,
    hideEdit,
    showReset,
    saveButtonText,
    isMultiSelect,
    onSelectMultiple
    //onCheckAllClick,
    //numSelected
  } = props;

  const [selected, setSelected] = React.useState<number[]>([]);

  const isSelected = (idx: number) => { return selected.indexOf(idx) !== -1 };

  const handleCheckClick = (event: React.MouseEvent<unknown>, idx: number) => {
    const selectedIndex = selected.indexOf(idx);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, idx);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);

    if(typeof onSelectMultiple === 'function') {
      const selectedData: T[] = [];
      newSelected.forEach(id => selectedData.push(data[id]));
      onSelectMultiple(selectedData);
    }
  }

  const handleCheckAllClick = (event: React.ChangeEvent<HTMLInputElement> ) => {
    if(event.target.checked) {
      const newSelected = data.map( (u, idx) => idx );
      if (typeof onSelectMultiple === 'function') {
        onSelectMultiple(data);
      }
      setSelected(newSelected);
      return;
    }
    if (typeof onSelectMultiple === 'function') {
      onSelectMultiple([]);
    }
    setSelected([]);
  };

  return <>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
              <TableCell padding="checkbox">
                  {isMultiSelect && (
                  <Checkbox 
                  indeterminate={selected.length > 0 && selected.length < data.length} 
                  checked={data.length > 0 && selected.length === data.length}
                  onChange={handleCheckAllClick}
                  />)}
              </TableCell>
            {headers.map((h, idx) => (
              <TableCell align='center' key={`head-${idx}`}>
                <strong>{h}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((u, idx) => {
            const rowkey = `body-${idx}`;
            const ComponentsFromProps = columns.map((cb, idx) => (
              <TableCell key={`custom-${idx}`}>{cb(u)}</TableCell>
            ));
            const isItemSelected = isSelected(idx);
            
            return hideAll ? (
              <TableRow key={rowkey}>{ComponentsFromProps}</TableRow>
            ) : (
              <TableRow key={rowkey} 
              selected={isItemSelected} 
              onClick={isMultiSelect ? (event) => handleCheckClick(event, idx) : () => {}}
              >
                <TableCell padding="checkbox">
                  {isMultiSelect && (
                  <Checkbox
                  checked={isItemSelected}
                  />)}
                </TableCell>
                {ComponentsFromProps}

                {/* edit button */}
                {hideEdit ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'edit')} size="large">
                      <Icon icon='edit' />
                    </IconButton>
                  </TableCell>
                )}
                {/* delete button */}
                {hideDelete ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'delete')} size="large">
                      <Icon icon='close' htmlColor='#8B0000' />
                    </IconButton>
                  </TableCell>
                )}
                {/* duplicate button */}
                {hideDuplicate ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'duplicate')} size="large">
                      <Icon icon='copy' />
                    </IconButton>
                  </TableCell>
                )}
                {/* reset button (not visible by default) */}
                {showReset ? (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'reset')} size="large">
                      <Icon icon='reset' />
                    </IconButton>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    {hideAll ? null : (
      <div>
        {hideAdd ? null : (
          <span>
            <Button onClick={(): void => onRowModified({} as T, 'add')} variant='outlined'>
              Add Row
            </Button>
          &nbsp; &nbsp;
          </span>
        )}
        {hideSave ? null : (
          <Box mt={1} mb={2}>
            <Button disabled={!canSave} onClick={onSave}>
              {saveButtonText ?? 'Save'}
            </Button>
          </Box>
        )}
      </div>
    )}
  </>;
}
