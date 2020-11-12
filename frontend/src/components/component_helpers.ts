import { Animal } from "../types/animal";

const canSaveObject = (requiredFields: string[], obj: any): boolean => {
  requiredFields.forEach((field) => {
    if (!obj[field]) {
      return false;
    }
  });
  return true;
};

const getTypeExportFields = (a: object): string[] => Object.keys(a);

const columnToHeader = (col: string): string => {
  const asArr = col.replace('_', ' ').split(' ');
  return asArr.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
};

export {
  canSaveObject,
  columnToHeader,
  getTypeExportFields,
};
