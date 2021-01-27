import { AxiosError } from "axios";

/** 
 * @param {K} key
 * @param {T} object of type T
 * given a property name of an object T, return its type.
 * let x = { foo: 10, bar: "hello!" };
 * getProperty(x, "foo"); // number
**/
function getProperty<T, K extends keyof T>(obj: T, key: K): unknown {
  return obj[key]; // Inferred type is T[K]
}

/**
 * shallow compare of objects for use in forms
 * values can only be primitive types
 * @param o1 the new object  
 * @param o2 the original object
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
  const asArr = prop.replaceAll('_', ' ').split(' ');
  return asArr.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
};

/**
 * some code headers dont match the corresponding table column names
 * when a dropdown option is chosen, emit the correct prop name
 */
// const getSelectCodeLabel = (prop: string): string => {
//   switch(prop){
//     case 'collar_make':
//       return 'make';
//     default:
//       return prop;
//   }
// }

/** 
 * returns a copy of the provided object with null / undefined / empty string removed
*/
const omitNull = <T,>(obj: T): T => {
  const copy = Object.assign(obj, {});
  Object.keys(copy)
    .filter(k => obj[k] === null || obj[k] === undefined || obj[k] === '')
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
 * @param err 
 */
const formatAxiosError = (err: AxiosError): string => `${err.response?.data ?? err.message}`;

export {
  columnToHeader,
  getProperty,
  formatAxiosError,
  objectCompare,
  omitNull,
  removeProps
};