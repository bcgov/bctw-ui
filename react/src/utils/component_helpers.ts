/**
 * shallow compare of objects for use in forms
 * values can only be primitive types
 * @param o1 the new object  
 * @param o2 the original object
 */
const objectCompare = (o1: object, o2: object): boolean => {
  for (const key of Object.keys(o1)) {
    // console.log(`o1: ${o1[key]} o2: ${o2[key]}}`)
    // consider emptystring and null 'the same'
    if (o1[key] === '' && o2[key] === null) {
      continue;
    }
    if (o1[key] !== o2[key]) {
      return false;
    }
  } 
  return true;
}

const columnToHeader = (col: string): string => {
  const asArr = col.replace('_', ' ').split(' ');
  return asArr.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
};

// const sortImportRow = (row: object): string => {
//   const keys = Object.keys(row).sort();
//   const values = keys.map((k: string) => row[k]).join();
//   return values;
// };

export {
  columnToHeader,
  objectCompare,
  // canSaveObject,
  // getTypeExportFields,
  // sortImportRow,
};
