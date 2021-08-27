// returns the number of digits after the decimal in a float
const countDecimals = (value: number): number => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

// formats lat long nicely
const formatLatLong = (lat: number, long: number): string => {
  return `${lat.toFixed(2)}\xb0 ${long.toFixed(2)}\xb0`;
};

// formats UTM nicely
const formatUTM = (zone: number, easting: number, northing: number): string => `${zone}/${easting}/${northing}`;

/**
 * given an array of type T, returns unique values of @param prop 
*/
const getUniqueValuesOfT = <T,>(arr: T[], prop: keyof T): string[] => {
  const ret = [];
  arr.forEach((p) => {
    if (!ret.includes(p[prop])) {
      ret.push(p[prop]);
    }
  });
  return ret;
};

/**
 * shallow compare of objects for use in forms
 * values can only be primitive types
 * @param o1 the new object  
 * @param o2 the original object
 * todo: deprecated?
 */
const objectCompare = (o1: Record<string, unknown>, o2: Record<string, unknown>): boolean => {
  for (const key of Object.keys(o1)) {
    // consider emptystring and null 'the same'
    if ((o1[key] === '' && o2[key] === null) || (o1[key] === null && o2[key] === '')) {
      continue;
    }
    if (o1[key] !== o2[key]) {
      return false;
    }
  }
  return true;
}

/**
 * formats a property name as a table header ex. population_unit -> Population Unit 
 * @param prop - property name to format
 */
const columnToHeader = (prop: string): string => {
  const asArr = prop
    .replaceAll('_', ' ')
    .replaceAll(' id', ' ID')
    .replaceAll('wlh', 'WLH') // used frequently
    .split(' ');
  return asArr.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
};

/** 
 * returns a copy of the provided object with null / undefined / empty string removed
*/
const omitNull = <T,>(obj: T): T => {
  const copy = Object.assign(obj, {});
  Object.keys(copy)
    .filter(k => obj[k] === null || obj[k] === undefined || obj[k] === '' || obj[k] === 'null' || obj[k] === -1)
    .forEach(k => delete (obj[k]));
  return copy;
}

/**
 * used for removing props that shouldn't be passed on to material ui components 
 * @param object to remove from
 * @param propsToRemove string array of properties to delete
 */
const removeProps = <T,>(obj: T, propsToRemove: string[]): T => {
  const copyOfT = {...obj};
  propsToRemove.forEach(p => delete copyOfT[p]);
  return copyOfT;
}

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

export {
  countDecimals,
  formatLatLong,
  formatUTM,
  getUniqueValuesOfT,
  objectCompare,
  columnToHeader,
  omitNull,
  removeProps,
  getProperty
};
