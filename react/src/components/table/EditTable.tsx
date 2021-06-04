import Button from 'components/form/Button';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { Icon } from 'components/common';
import { BCTW } from 'types/common_types';
import { IPlainTableProps } from './table_interfaces';

export type EditTableRowAction = 'add' | 'delete' | 'duplicate' | 'edit';

type EditTableProps<T> = IPlainTableProps<T> & {
  canSave: boolean;
  columns: ((d: T) => JSX.Element)[]; 
  data: T[];
  onRowModified: (n: T, action: EditTableRowAction) => void;
  onSave: () => void;
};

/**
 * @param columns - array of functions that return a component (rendered before the editing buttons)
 * @param canSave - is the save button clickable
 * @param data - the table data
 * @param onRowModified - call parent handler with the row clicked and @type {EditTableRowAction}
 * @param onSave - calls parent handler when save button clicked
*/
export default function EditTable<T extends BCTW>(props: EditTableProps<T>): JSX.Element {
  const { canSave, headers, data, onRowModified, onSave, columns } = props;

  return (
    <>
      <Table className={'udf-table'}>
        <TableHead>
          <TableRow>
            {headers.map((h, idx) => (
              <TableCell align='center' key={idx}>
                <strong>{h}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((u, idx) => {
            return (
              <TableRow key={idx}>
                {/* render columns passed in from props */}
                {columns.map((cb) => cb(u))}

                {/* edit button */}
                <TableCell>
                  <IconButton onClick={(): void => onRowModified(u, 'edit')}>
                    <Icon icon='edit' />
                  </IconButton>
                </TableCell>
                {/* delete button */}
                <TableCell>
                  <IconButton onClick={(): void => onRowModified(u, 'delete')}>
                    <Icon icon='close' />
                  </IconButton>
                </TableCell>
                {/* duplicate button */}
                <TableCell>
                  <IconButton disabled={false} onClick={(): void => onRowModified(u, 'duplicate')}>
                    <Icon icon='copy' />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className={'side-btns'}>
        <Button onClick={(): void => onRowModified(null, 'add')} color='primary' variant='outlined'>Add Row</Button>
        <Button disabled={!canSave} onClick={onSave} color='primary' variant='contained'>Save</Button>
      </div>
    </>
  );
}
