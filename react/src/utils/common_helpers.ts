import { ITableFilter } from 'components/table/table_interfaces';

// returns the number of digits after the decimal in a float
const countDecimals = (value: number): number => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

// formats lat long nicely
const formatLatLong = (lat: number, long: number): string => {
  return `${lat.toFixed(2)}\xb0 ${long.toFixed(2)}\xb0`;
};
// Appends ('s) to end of word if multiple n values
const pluralize = (n: number, word: string) => (n > 1 || n == 0 ? `${word}'s` : word);
//Capitalizes the first letter of a word
const capitalize = (s: string): string => s && s[0].toUpperCase() + s.slice(1);

// formats UTM nicely
const formatUTM = (zone: number, easting: number, northing: number): string => `${zone}/${easting}/${northing}`;

/**
 * given an array of type T, returns unique values of @param prop
 */
const getUniqueValuesOfT = <T>(arr: T[], prop: keyof T): string[] => {
  const ret: string[] = [];
  arr.forEach((p) => {
    // fixme: always string?
    const value = p[prop] as unknown as string;
    if (!ret.includes(value)) {
      ret.push(value);
    }
  });
  return ret;
};

/**
 * formats a property name as a table header ex. collection_units -> Population Unit
 * @param prop - property name to format
 */
const columnToHeader = (prop: string): string => {
  const asArr = prop
    .replaceAll('_display', '')
    .replaceAll('_', ' ')
    .replaceAll('wmu', 'Wildlife Management Unit')
    .replaceAll(' id', ' ID')
    .replaceAll('wlh', 'WLH')
    .replaceAll('utm', 'UTM')
    .replaceAll('cod', 'Cause Of Death')
    .split(' ');
  return asArr.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
};

/**
 * formats a header to a property name ex.Population Unit -> collection_units
 * @param prop - header name to format backwards
 */

const headerToColumn = (prop: string): string => {
  const asArr = prop
    //.replaceAll(' ', '_')
    .replaceAll(' ID', ' id')
    .replaceAll('WLH', 'wlh')
    .replaceAll('UTM', 'utm')
    .split(' ');
  return asArr
    .map((a) => a.charAt(0).toLowerCase() + a.slice(1))
    .join(' ')
    .replaceAll(' ', '_');
};
/**
 * returns a copy of the provided object with null / undefined / empty string removed
 */
const omitNull = <T>(obj: T): T => {
  const copy = Object.assign(obj, {});
  Object.keys(copy)
    .filter((k) => obj[k] === null || obj[k] === undefined || obj[k] === '' || obj[k] === 'null' || obj[k] === -1)
    .forEach((k) => delete obj[k]);
  return copy;
};

/**
 * used for removing props that shouldn't be passed on to material ui components
 * @param object to remove from
 * @param propsToRemove string array of properties to delete
 */
const removeProps = <T>(obj: T, propsToRemove: string[]): T => {
  const copyOfT = { ...obj };
  propsToRemove.forEach((p) => delete copyOfT[p]);
  return copyOfT;
};

/** 
 * @param {K} key
 * @param {T} object of type T
 * given a property name of an object T, return its type.
  ex.
    let x = { foo: 10, bar: "hello!" };
    getProperty(x, "foo"); // number
**/
function getProperty<T, K extends keyof T>(obj: T, key: K): unknown {
  return obj[key]; // Inferred type is T[K]
}

/**
 * some components require a method prop that is overloaded in a parent component
 * ex. EditModal requires an onSave method.
 */
const doNothingAsync = async (): Promise<void> => {
  /* do nothing */
};
const doNothing = (): void => {
  /* do nothing */
};

// is the unknown object a table filter?
const isSearchTerm = (obj: unknown): obj is ITableFilter => {
  const props = Object.keys(obj); // safe for types that aren't objects, will be []
  return props.includes('keys') && props.includes('term');
};

/**
 * iterates unknown function parameters (ex. ...args)
 * returns @type { ITableFilter } if located
 */
const parseArgs = (args: unknown[]): Omit<ITableFilter, 'operator'>[] => {
  const ret = [];
  for (let i = 0; i < args.length; i++) {
    const element = args[i];
    if (typeof element === 'object') {
      if (isSearchTerm(element)) {
        const { term, keys } = element;
        if (term && keys) {
          ret.push({ keys, term });
        }
      }
    }
  }
  return ret;
};
/**
 * Converts a class to an array of keys
 * @param keys class converted to its object keys. ie Object.keys(new Critter())
 * @param startsWith items which append the array
 * @param excluded array of items to exclude from final array.
 *
 **/
const classToArray = <T>(keys: string[], startsWith: (keyof T)[], excluded?: (keyof T)[]): (keyof T)[] => {
  const filterOut = excluded ? [...startsWith, ...excluded] : startsWith;
  const ke = keys.filter((k) => !(filterOut as string[]).includes(k)) as unknown as (keyof T)[];
  return [...startsWith, ...ke];
};

export {
  columnToHeader,
  countDecimals,
  doNothingAsync,
  doNothing,
  formatLatLong,
  formatUTM,
  getProperty,
  getUniqueValuesOfT,
  omitNull,
  parseArgs,
  removeProps,
  capitalize,
  classToArray,
  headerToColumn,
  pluralize
};
