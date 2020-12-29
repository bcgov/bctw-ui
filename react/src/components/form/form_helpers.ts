import { getProperty } from 'utils/common';

export enum InputType { 
  text = 'text',
  number = 'number',
  select = 'select',
  check = 'check',
  unknown = 'unknown'
}

const stringsThatAreBools = ['Y', 'N', 'true', 'false'];
/**
 * 
 * @param obj the object being edited 
 * @param editableProps object properties to be added as form inputs
 * @param selectableProps which properties will be used in select inputs
 * @return {InputType}
 */
function getInputTypesOfT<T>(obj: T, editableProps: string[], selectableProps: string[]): { key: string, type: InputType, value: any }[] {
  // console.log(JSON.stringify(obj));
  return editableProps.map((key: string) => {
    if (selectableProps.includes(key)) {
      return { key, type: InputType.select, value: obj[key] };
    }
    if (stringsThatAreBools.includes(obj[key])) {
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

const isValidEditObject = <T, >(obj: T) => Object.keys(obj).length > 0;

const validateRequiredFields = (o: any, required: string[]): Record<string, unknown> => {
  const errors = {};
  required.forEach(field => {
    if (!o[field]) {
      errors[field] = 'Required';
    } else {
      delete errors[field];
    }
  })
  return errors;
}

export {
  getInputTypesOfT,
  isValidEditObject,
  validateRequiredFields,
}