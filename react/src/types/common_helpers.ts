import { BCTW } from './common_types';

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

// given a property of an object that extends the BCTW type, return a label string
const formatLabel = <T extends BCTW>(o: T, key: string): string => o.formatPropAsHeader(key);

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

export {
  countDecimals,
  formatLatLong,
  formatUTM,
  formatLabel,
  getUniqueValuesOfT,
};
