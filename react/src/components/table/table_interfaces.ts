import { AxiosError } from 'axios';
import { UseQueryResult } from 'react-query';
import { BCTW } from 'types/common_types';

type Order = 'asc' | 'desc';

/**
 * @param property key of T used to sort by
 * @param order see @type {Order}
 */
interface ITableSortProp<T> {
  property: keyof T;
  order: Order;
}

/**
 * a hook from @file 'hooks/useTelemetryApi.ts passed to a data table 
*/
type ITableQuery<T> = (
  page: number,
  param?: unknown,
  config?: Record<string, unknown>
) => UseQueryResult<T[], AxiosError>;

/**
 * @param defaultSort 
 * @param query - the bctwApi hook 
 * @param onNewData handler to call when new data is loaded
 */
interface ITableQueryProps<T extends BCTW> {
  defaultSort?: ITableSortProp<T>;
  param?: unknown;
  // query: ITableQuery<T>
  query: any; //fixme:
  onNewData?: (data: T[]) => void;
}

interface ICustomTableColumn<T> {
  header: (row: T, idx: number) => JSX.Element;
  column: (row: T, idx: number) => JSX.Element;
}

/**
 * @param customColumns array of functions that return components to add as additional columns
 * @param headers displays all props of T unless this is included
 * @param isMultiSelect renders a row of checkboxes and a special toolbar if true
 * @param paginate should the pagination actions be displayed
 * @param queryProps which query to use - see @type {ITableQuery}
 * @param title displayed as table title
 * @param onSelect parent handler triggered when a row is clicked
 * @param onSelectMultiple parent handler triggered when a row is checked if @param isMultiSelect
*/
type ITableProps<T> = {
  customColumns?: ICustomTableColumn<T>[];
  headers?: string[];
  isMultiSelect?: boolean;
  alreadySelected?: string[]
  paginate?: boolean;
  queryProps: ITableQueryProps<T>;
  title?: string;
  onSelect?: (row: T) => void;
  onSelectMultiple?: (rowIds: T[]) => void;
};

/**
 * interface used to generate headers in TableHead
*/
interface HeadCell<T> {
  disablePadding: boolean;
  id: keyof T;
  label: string;
  numeric: boolean;
}

/**
 * @param customHeaders passed from the main tables customColumns
 * @param headerData an instance of T
 * @param headersToDisplay string array of what should be displayed as a header
 * @param isMultiSelect boolean
 * @param numSelected used when @param isMultiSelect to determine if all rows are selected
 * @param onRequestSort sort handler
 * @param order see @type {Order}
 * @param orderBy should be a key of T
 * @param onSelectAllClick handler for when table header 'select all' is checked
*/
interface ITableHeadProps<T> {
  customHeaders: ((row: T, idx: number) => JSX.Element)[];
  headerData: T;
  headersToDisplay: string[];
  isMultiSelect: boolean;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export type {
  HeadCell,
  Order,
  ICustomTableColumn,
  ITableQuery,
  ITableHeadProps,
  ITableProps,
  ITableQueryProps,
  ITableSortProp
};
