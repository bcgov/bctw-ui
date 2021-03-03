const countDecimals = (value: number): number => {
  if(Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0; 
}

// some columns that should be bools are stored as varchars ex calf_at_heel
const evaluateBoolean = (str: string): boolean => {
  // console.log('val passed in', str);
  return str === 'true';
}

export {
  countDecimals,
  evaluateBoolean,
}