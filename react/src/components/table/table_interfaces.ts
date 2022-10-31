import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { UseQueryResult } from 'react-query';

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
 * a property name from the useTelemetry hook (@file 'hooks/useTelemetryApi.ts)
 * is passed to a data table
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
interface ITableQueryProps<T> {
  defaultSort?: ITableSortProp<T>;
  param?: unknown;
  query: any;
  // query: APIHandler;
  onNewData?: (data: T[]) => void;
}

interface ICustomTableColumn<T> {
  header: JSX.Element;
  column: (row: T, idx: number) => JSX.Element;
}

/**
 * @param headers displays all props of T unless this is included
 * @param title displayed as table title
 * @param onSelect parent handler triggered when a row is clicked
 */
type PlainTableProps<T> = {
  headers: (keyof T)[];
  title?: string;
  onSelect?: (row: T) => void;
};

/**
 * @param customColumns array of functions that return components to add as additional columns
 * @param isMultiSelect renders a row of checkboxes and a special toolbar if true
 * @param paginate should the pagination actions be displayed
 * @param queryProps which query to use - see @type {ITableQuery}
 * @param onSelectMultiple parent handler triggered when a row is checked if @param isMultiSelect
 * @param deleted notify the datatable that a row with this identifier has been removed
 */
type DataTableProps<T> = PlainTableProps<T> & {
  customColumns?: ICustomTableColumn<T>[];
  isMultiSelect?: boolean;
  isMultiSearch?: boolean;
  showValidRecord?: boolean;
  alreadySelected?: string[];
  resetSelections?: number; //Placeholder to trigger reset
  paginate?: boolean;
  queryProps: ITableQueryProps<T>;
  onSelectMultiple?: (rows: T[]) => void;
  deleted?: string;
  updated?: string;
  exporter?: JSX.Element;
  disableSearch?: boolean;
};

/**
 * interface used to generate headers in TableHead
 */
interface HeadCell<T> {
  disablePadding: boolean;
  id: keyof T;
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
type TableHeadProps<T> = {
  customHeaders: JSX.Element[];
  headerData: T;
  headersToDisplay: (keyof T)[];
  isMultiSelect: boolean;
  numSelected: number;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type FilterOperator = 'equals' | 'contains';

interface ITableFilter {
  keys: string[];
  operator: FilterOperator;
  term: string;
}

export type {
  HeadCell,
  Order,
  ICustomTableColumn,
  ITableQuery,
  TableHeadProps,
  PlainTableProps,
  DataTableProps,
  ITableQueryProps,
  ITableSortProp,
  ITableFilter,
  FilterOperator
};
