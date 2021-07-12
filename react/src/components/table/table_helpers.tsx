import { matchSorter } from 'match-sorter';
import { getProperty, countDecimals } from 'utils/common_helpers';
import { Order, HeadCell } from 'components/table/table_interfaces';
import { dateObjectToTimeStr } from 'utils/time';
import { Icon } from 'components/common';

/**
 * converts an object to a list of HeadCells
 * @param obj
 * @param propsToDisplay the object's properties that should be displayed in the table
 * @return {HeadCell<T>[]}
 */
function createHeadCell<T>(obj: T, propsToDisplay: string[]): HeadCell<T>[] {
  return propsToDisplay.map((k) => {
    const isNumber = typeof getProperty(obj, k as keyof T) === 'number';
    return {
      disablePadding: false,
      id: k as keyof T,
      label: k,
      numeric: isNumber
    };
  });
}

/**
 * comparator for a type. properties must be of primitive types
 * string or number to sort successfully
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**  
 * @param {Order} order
 * @param {Key} orderBy
  calls the descendingComparator with provided order
**/
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b): number => descendingComparator(a, b, orderBy)
    : (a, b): number => -descendingComparator(a, b, orderBy);
}

/*
  sorts an array of T with the provided comparator
*/
function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface ICellFormat {
  align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  value: string | number | JSX.Element;
}
/**
 *
 * @param obj object being displayed
 * @param key the property to render in this table cell
 */
function formatTableCell<T>(obj: T, key: string): ICellFormat {
  const value = obj[key];
  if (typeof value === 'boolean') {
    return { align: 'center', value: <Icon icon={value ? 'done' : 'close'} /> };
  }
  if (typeof value?.getMonth === 'function') {
    return { align: 'right', value: dateObjectToTimeStr(value) };
  } else if (typeof value === 'number') {
    const formatted = countDecimals(value) > 2 ? value.toFixed(2) : value;
    return { align: 'right', value: formatted };
  } else if (typeof value === 'string') {
    return { align: 'center', value };
  }
  return { align: 'left', value };
}

/**
 * @param rows array of data [{a: "a", b: "b"}, {a: "c", b: "d"}]
 * @param keys keys to search ["a", "b"]
 * @param filterValue potentially multi-word search string "two words"
 * @returns
 */
function fuzzySearchMutipleWords<T>(rows: T[], keys: string[], filterValue: string): T[] {
  if (!filterValue || !filterValue.length) {
    return rows;
  }
  const terms = filterValue.split(' ');
  if (!terms) {
    return rows;
  }
  // reduceRight will mean sorting is done by score for the _first_ entered word.
  return terms.reduceRight((results, term) => matchSorter(results, term, { keys }), rows);
}

export { fuzzySearchMutipleWords, descendingComparator, getComparator, stableSort, createHeadCell, formatTableCell };
