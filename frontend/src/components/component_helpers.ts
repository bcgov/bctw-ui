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

export {
  canSaveObject,
  getTypeExportFields,
};
