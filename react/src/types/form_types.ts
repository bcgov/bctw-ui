import { BaseTextFieldProps } from '@mui/material';
import { ICbRouteKey } from 'critterbase/types';
import { CSSProperties, ReactNode } from 'react';
import CaptureEvent, { CaptureEvent2 } from './events/capture_event';
import MortalityEvent from './events/mortality_event';
import { RouteKey } from 'AppRouter';
import { QueryStatus } from 'react-query';

export type KeyType = string | number | symbol;
//export type taxonCast = {[key in keyof typeof etaxon]?: string};
export enum eInputType {
  text = 'text',
  number = 'number',
  check = 'check',
  unknown = 'unknown',
  date = 'date',
  datetime = 'datetime',
  time = 'time',
  code = 'code',
  multiline = 'multiline',
  select = 'select',
  cb_select = 'cb_select', //critterbase select field
  cb_capture_fields = 'cb_capture_fields'
}

/**
 *
 */
export type FormBaseProps = Pick<BaseTextFieldProps, 'label'> & {
  changeHandler: FormChangeEvent;
  propName: KeyType;
};

/**
 * used to assist defining form types for null property values
 * ex. a device retrieved date could be null, but it should be rendered
 * in a form as a date input
 */
export type FormFieldObject<T> = Pick<BaseTextFieldProps, 'disabled' | 'required'> & {
  prop: keyof T;
  type: eInputType;
  taxon?: string[];
  codeName?: string;
  cbRouteKey?: ICbRouteKey;
  span?: boolean;
  tooltip?: ReactNode;
  validate?: <T>(input: T) => string;
  style?: CSSProperties;
};

export const FormCommentStyle: CSSProperties = { display: 'flex', flexGrow: 1 };

// spread in form field constructors to make a field required
export const isRequired = { required: true };
export const isDisabled = { disabled: true };

// what a form component passes when it's changed
// ex: {name: 'bill', error: false}
export type InboundObj = {
  [key: string]: unknown | {id: string, label: string};
  label?: string;
  id?: string;
  error?: boolean;
  nestedEventKey?: keyof Pick<CaptureEvent2, 'capture_location' | 'release_location'> | keyof Pick<MortalityEvent, 'location'>;
  eventKey?: string;
};

/**
 *
 */
export type FormChangeEvent = { (v: InboundObj): void };
export type CbRouteStatusHandler = { (q: QueryStatus, key: ICbRouteKey): void }

/**
 * form change events pass an object with:
 * a) a keyof T / value
 * b) error: boolean
 * @returns the keyof T / value record
 */
export const parseFormChangeResult = <T>(changed: InboundObj): [keyof T, unknown] => {
  const key = Object.keys(changed)[0] as keyof T;
  const value = Object.values(changed)[0];
  return [key, value];
};

/**
 * todo:
 */
export type Overlap<T, U> = { [K in keyof T & keyof U]: U[K] };
