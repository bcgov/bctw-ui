import { matchSorter } from 'match-sorter';
import { getProperty, countDecimals } from 'utils/common_helpers';
import { Order, HeadCell } from 'components/table/table_interfaces';
import { dateObjectToTimeStr, formatTime } from 'utils/time';
import { Icon, Tooltip } from 'components/common';
import { isDayjs } from 'dayjs';
import { Collar, eDeviceStatus } from 'types/collar';

/**
 * converts an object to a list of HeadCells
 * @param obj
 * @param propsToDisplay the object's properties that should be displayed in the table
 * @return {HeadCell<T>[]}
 */
function createHeadCell<T>(obj: T, propsToDisplay: (keyof T)[]): HeadCell<T>[] {
  return propsToDisplay.map((k) => {
    const isNumber = typeof getProperty(obj, k as keyof T) === 'number';
    return {
      disablePadding: false,
      id: k as keyof T,
      // label: k,
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
): (a: { [key in Key] }, b: { [key in Key] }) => number {
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

const getDeviceStatusIcon = (value: eDeviceStatus): JSX.Element => {
  switch (value) {
    case eDeviceStatus.active:
      return <Icon icon={'circle'} htmlColor={'green'} />;
    case eDeviceStatus.offline:
      return <Icon icon={'circle'} htmlColor={'red'} />;
    case eDeviceStatus.potential_malfunction:
      return <Icon icon={'circle'} htmlColor={'orange'} />;
    case eDeviceStatus.mortality:
      return <Icon icon={'alert'} htmlColor={'red'} />;
    case eDeviceStatus.potential_mortality:
      return <Icon icon={'alert'} htmlColor={'orange'} />;
    default:
      return null;
  }
};

interface ICellFormat {
  align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  value: unknown;
}
/**
 *
 * @param obj object being displayed
 * @param key the property to render in this table cell
 * todo: ...not using align just return value?
 */
const align: Pick<ICellFormat, 'align'> = { align: 'left' };
function formatTableCell<T>(obj: T, key: keyof T): ICellFormat {
  const value: unknown = obj[key];
  if (key === 'device_status') {
    const icon = getDeviceStatusIcon(value as eDeviceStatus);
    return icon
      ? {
          ...align,
          value: (
            <Tooltip title={value} placement='left'>
              {icon}
            </Tooltip>
          )
        }
      : { ...align, value };
  }
  if (typeof value === 'boolean') {
    return { ...align, value: <Icon icon={value ? 'done' : 'close'} /> };
  }
  if (typeof (value as Date)?.getMonth === 'function') {
    return { ...align, value: dateObjectToTimeStr(value as Date) };
  } else if (isDayjs(value)) {
    return { ...align, value: value.isValid() ? value.format(formatTime) : '' };
  } else if (typeof value === 'number') {
    const formatted = countDecimals(value) > 2 ? value.toFixed(2) : value;
    return { ...align, value: formatted };
  } else if (typeof value === 'string') {
    return { ...align, value };
  }
  return { ...align, value };
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

export {
  fuzzySearchMutipleWords,
  getDeviceStatusIcon,
  descendingComparator,
  getComparator,
  stableSort,
  createHeadCell,
  formatTableCell
};
