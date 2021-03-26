const countDecimals = (value: number): number => {
  if(Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0; 
}

// some columns that should be bools are stored as varchars ex calf_at_heel
const evaluateBoolean = (str: string): boolean => {
  // console.log('val passed in', str);
  return str === 'true';
}

const formatLatLong = (lat: number, long: number): string => {
  return `${lat.toFixed(2)}\xb0 ${long.toFixed(2)}\xb0`;
}

const formatUTM = (zone: number, easting: number, northing: number): string => `${zone}/${easting}/${northing}`;

export {
  countDecimals,
  evaluateBoolean,
  formatLatLong,
  formatUTM,
}