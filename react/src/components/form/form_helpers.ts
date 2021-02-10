import { getProperty } from 'utils/common';

export enum InputType {
  text = 'text',
  number = 'number',
  select = 'select',
  check = 'check',
  unknown = 'unknown'
}

const stringsThatAreBools = ['Y', 'N', 'true', 'false'];
// some properties that should be stored as booleans in the db arent.
const propsToRenderAsCheckbox = ['calf_at_heel'];
/**
 * @param obj the object being edited
 * @param editableProps object properties to be added as form inputs
 * @param selectableProps which properties will be used in select inputs
 * @return {InputType}
 */
function getInputTypesOfT<T>(
  obj: T,
  editableProps: string[],
  selectableProps: string[]
): { key: string; type: InputType; value: unknown }[] {
  return editableProps.map((key: string) => {
    if (selectableProps.includes(key)) {
      return { key, type: InputType.select, value: obj[key] };
    }
    if (stringsThatAreBools.includes(obj[key]) || propsToRenderAsCheckbox.includes(key)) {
      return { key, type: InputType.check, value: obj[key] };
    }
    const valType = getProperty(obj, key as any);
    switch (typeof valType) {
      case 'number':
        return { key, type: InputType.number, value: obj[key] };
      case 'boolean':
        return { key, type: InputType.check, value: obj[key] };
      case 'string':
      default:
        return { key, type: InputType.text, value: obj[key] };
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

export { getInputTypesOfT, isValidEditObject, validateRequiredFields };
