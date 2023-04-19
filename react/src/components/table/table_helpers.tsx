import { matchSorter } from 'match-sorter';
import { getProperty, countDecimals } from 'utils/common_helpers';
import { Order, HeadCell } from 'components/table/table_interfaces';
import { dateObjectToTimeStr, formatT, formatTime, getDaysDiff } from 'utils/time';
import { Icon } from 'components/common';
import dayjs, { isDayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { eDeviceStatus } from 'types/collar';
import { Chip } from '@mui/material';
import { eAnimalStatus } from 'types/animal';
dayjs.extend(relativeTime);
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
  const emptyA = a[orderBy] == null || String(a[orderBy]) === '';
  const emptyB = b[orderBy] == null || String(b[orderBy]) === '';
  if(!emptyB && emptyA){
    return -1;
  }
  if(emptyB && !emptyA) {
    return 1;
  }


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
function getComparator<Key extends keyof unknown>(
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
  /*const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);*/
  /** No idea why the above was done when you can just pass the comparator to the sort function directly.
   * Leaving it commented just in case it's relevant again eventually.
   */
  const sortedArr = array.slice().sort(comparator);
  return sortedArr;
}
/** Renders the coloured tags for species and collars */

const getTag = (value: string, color?: string, status?: 'error' | 'warning' | 'success'): JSX.Element => {
  const style = { width: '110px' };
  const defaultColor = '#bdbdbd';
  if (status) return <Chip label={value} sx={style} color={status} />;
  return <Chip label={value} sx={{ backgroundColor: color ? color : defaultColor, color: '#ffff', ...style }} />;
};

/**
 * * CRITTERBASE INTEGRATED *
 * TODO: add support for more taxons, change species -> taxon
 * @param {string} key
 * @param {string} value
 * @return {*}  {JSX.Element}
 */
const formatTag = (key: string, value: string): JSX.Element => {
  if (key === 'device_status') {
    const { active, potential_mortality, mortality, potential_malfunction, malfunction } = eDeviceStatus;
    switch (value) {
      case active:
        return getTag(value, null, 'success');
      case potential_malfunction:
      case malfunction:
        return getTag(malfunction, null, 'warning');
      case potential_mortality:
      case mortality:
        return getTag(mortality, null, 'error');
    }
  }
  if (key === 'animal_status') {
    const {alive, mortality, in_translocation, potential_mortality} = eAnimalStatus;
    switch(value) {
      case alive:
        return getTag(value, null, 'success');
      case in_translocation:
        return getTag(in_translocation, null, 'warning');
      case potential_mortality:
        return getTag('P. Mortality', null, 'warning');
      case mortality:
        return getTag(mortality, null, 'error');
    }
  }
  if (key === 'species') {
    switch (value) {
      case 'Caribou':
        return getTag(value, '#9575cd');
      case 'Moose':
        return getTag(value, '#64b5f6');
      case 'Grey Wolf':
        return getTag(value, '#4db6ac');
      case 'Grizzly Bear':
        return getTag(value, '#81c784');
    }
    return getTag(value); // returns default tag color for unknown values
  }
  if (key === 'last_transmission_date') {
    const { diff, asText } = getDaysDiff(dayjs(value));
    if (!dayjs(value).isValid()) return getTag('Unknown');
    if (diff < 7) return getTag(asText, null, 'warning');
    if (diff <= 1) return getTag(asText, null, 'success');
    return getTag(asText, null, 'error');
  }
  // if (key === 'last_update_attempt') {
  //   return getTag(formatT(dayjs()), null, 'success');
  // }
  return getTag('Unknown');
};

interface Unit {
  unit_name: string;
}

interface ICellFormat {
  align: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  value: unknown;
}
/**
 * * CRITTERBASE INTEGRATED *
 * TODO: add support for keys other than 'unit_name'
 * @param obj object being displayed
 * @param key the property to render in this table cell
 */
const align: Pick<ICellFormat, 'align'> = { align: 'left' };
function formatTableCell<T>(obj: T, key: keyof T): ICellFormat {
  const value: unknown = obj[key];
  if(key === 'collection_unit') { // maps array of collection units to comma delimited string
    return { ...align, value: (value as Unit[]).map((item) => item.unit_name).join(',')}
  }
  if (['device_status', 'species', 'last_transmission_date'].includes(key as string)) {
    return { ...align, value: formatTag(key as string, isDayjs(value) ? formatT(value) : (value as string)) };
  }
  if (key === 'last_update_attempt') {
    return { ...align, value: formatT(dayjs()) };
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

const isFunction = (f: unknown): boolean => typeof f === 'function';

export {
  fuzzySearchMutipleWords,
  getTag,
  formatTag,
  descendingComparator,
  getComparator,
  stableSort,
  createHeadCell,
  formatTableCell,
  isFunction
};
