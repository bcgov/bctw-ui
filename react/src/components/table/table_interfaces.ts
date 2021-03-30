import { UseQueryResult } from 'react-query';
import { BCTW } from 'types/common_types';

type Order = 'asc' | 'desc';

interface ITableSortProp<T> {
  property: keyof T;
  order: Order;
}

/**
 *
 */
type ITableQuery<T> = (
  page: number,
  param?: string | number | unknown,
  config?: Record<string, unknown>
  // ) => UseQueryResult<T[], AxiosError>;
) => UseQueryResult;

/**
 * @param query - name of api hook
 * @param queryProp - param to pass to hook
 * @param onNewData handler to call when new data is loaded
 */
interface ITableQueryProps<T extends BCTW> {
  defaultSort?: ITableSortProp<T>;
  param?: string | number | unknown;
  // fixme:
  query: any;
  // query: (page: number, param?: number | string | 'unknown') => UseQueryResult<T[], AxiosError>;
  onNewData?: (data: T[]) => void;
}

interface ICustomTableColumn<T> {
  header: (row: T, idx: number) => JSX.Element;
  column: (row: T, idx: number) => JSX.Element;
}

/**
 * @param columns array of functions that return components to add as additional columns
 * @param headers assuming not all data properties are displayed in the table. * required
 * @param isMultiSelect render row of checkboxes and different toolbar - default to false
 * @param paginate should the pagination actions be displayed?
 * @param queryProps which query to use
 * @param rowIdentifier what uniquely identifies a row (ex device_id for a collar). defaults to 'id'
 * @param title display as table title
 * @param onSelect parent handler triggered when a row is clicked
 * @param onSelectMultiple isMultiSelect must be true
 */

type ITableProps<T> = {
  customColumns?: ICustomTableColumn<T>[];
  headers?: string[];
  isMultiSelect?: boolean;
  alreadySelected?: string[]
  paginate?: boolean;
  queryProps: ITableQueryProps<T>;
  // rowIdentifier?: string;
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
 * @param headerData an instance of a BCTW class passed from the table query to API
 * @param headersToDisplay string array of what should be displayed as a header
 * @param isMultiSelect passed from parent table
 * @param numSelected used in multiselect tables to determine if all rows are selected
 * @param onRequestSort sort handler
 * @param onSelectAllClick passed from the table prop
 *
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
