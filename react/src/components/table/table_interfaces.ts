type Order = 'asc' | 'desc';

interface ITableSortProp<T> {
  property: keyof T;
  order: Order;
}

/**
 * @param query - name of api hook 
 * @param queryProp - param to pass to hook
 * @param onNewData handler to call when new data is loaded
 */
interface ITableQueryProps<T> {
  query: string;
  queryParam?: string | number;
  onNewData?: (data: T[]) => void;
  defaultSort?: ITableSortProp<T>;
}

/**
 * @param columns components to add as additional columns
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
  columns?: JSX.Element[];
  headers?: string[];
  isMultiSelect?: boolean;
  paginate?: boolean;
  queryProps: ITableQueryProps<T>;
  rowIdentifier?: keyof T;
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

export type {
  HeadCell,
  Order,
  ITableProps,
  ITableQueryProps,
  ITableSortProp,
}