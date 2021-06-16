export enum eInputType {
  text = 'text',
  number = 'number',
  select = 'select',
  check = 'check',
  unknown = 'unknown',
  date = 'date'
}

/**
 * used to help create forms
 * in the function @function {getInputTypesOfT}
 */
type FormInputType = {
  key: string;
  type: eInputType;
  value: unknown;
  codeName?: string;
};

/**
 * used to assist defining form types for null property values
 * ex. a device retrieved date could be null, but it should be rendered
 * in a form as a date input
 */
type FormFieldObject<T> = {
  prop: keyof T;
  isCode?: boolean;
  codeName?: string;
  isDate?: boolean;
  isBool?: boolean;
  required?: boolean;
  span?: boolean;
};

export type {
  FormInputType,
  FormFieldObject,
}