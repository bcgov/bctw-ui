import { FormFieldObject, eInputType, FormInputType } from 'types/form_types';

// some properties that should be stored as booleans in the db arent.
const stringsThatAreBools = ['true', 'false'];

/**
 * @param obj the object being edited
 * @param editableProps object properties to be added as form inputs
 * @param selectableProps which properties will be used in select inputs
 * @return array of @type {FormInputType}
 */
function getInputTypesOfT<T>(obj: T, editableProps: FormFieldObject<T>[], selectableProps: string[]): FormInputType[] {
  return editableProps.map((field: FormFieldObject<T>) => {
    const { prop, isCode, codeName, isDate } = field;
    const key = prop as string;
    const value = obj[key];

    if (selectableProps.includes(key) || isCode) {
      return { key, type: eInputType.select, value, codeName };
    }
    if (stringsThatAreBools.includes(obj[prop as string])) {
      return { key, type: eInputType.check, value };
    }
    if (typeof (value as unknown as Date)?.getDay === 'function' || isDate) {
      return { key, type: eInputType.date, value };
    } 
    else {
      switch (typeof value) {
        case 'number':
          return { key, type: eInputType.number, value };
        case 'boolean':
          return { key, type: eInputType.check, value };
        case 'string':
        default:
          return { key, type: eInputType.text, value };
      }
    }
  });
}

// returns true if the object has any non-prototype properties
const isValidEditObject = <T>(obj: T): boolean => Object.keys(obj).length > 0;

/**
 * basic form validator for required fields
 * @param o the object of type T being validated
 * @param required required keys that must have a value to be considered valid
 */
const validateRequiredFields = <T>(o: T, required: string[]): Record<string, unknown> => {
  const errors = {};
  required.forEach((field) => {
    if (!o[field]) {
      errors[field] = 'Required';
    } else {
      delete errors[field];
    }
  });
  return errors;
};

/**
 * given an error object, determine if it contains errors.
 * it contains an error if the value is anything that js evaluates to true
 * ex. '' and undefined would be false, but 'hi' would be true
 */
const objHasErrors = (errorObj: Record<string, unknown>): boolean => {
  return !!Object.values(errorObj).filter((f) => f).length;
};

export { getInputTypesOfT, isValidEditObject, validateRequiredFields, objHasErrors };
