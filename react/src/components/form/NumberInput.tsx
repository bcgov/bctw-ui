import { StandardTextFieldProps, TextField } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { inputPropsToRemove } from 'components/form/TextInput';
import { isFunction } from 'components/table/table_helpers';
import { FormStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useEffect, useState } from 'react';
import { FormBaseProps } from 'types/form_types';
import { removeProps } from 'utils/common_helpers';

type NumberInputProps = FormBaseProps &
  StandardTextFieldProps & {
    defaultValue?: number;
    validate?: (v: number) => string;
  };

/**
 *
 */
export default function NumberField(props: NumberInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, validate, required } = props;

  const empty = '';
  const [val, setVal] = useState<number | ''>(typeof defaultValue === 'number' ? defaultValue : empty);
  const [err, setErr] = useState(required ? FormStrings.isRequired : empty);

  useEffect(() => {
    if (!defaultValue && required) {
      setValueError(empty, FormStrings.isRequired);
      return;
    }

    if (typeof defaultValue === 'number') {
      if (isFunction(validate)) {
        setValueError(defaultValue, validate(defaultValue));
        return;
      }
    }
    setValueError(defaultValue, empty);
  }, [defaultValue]);

  //To minimize the changeHandler from being called infinite times
  useEffect(() => {
    if (defaultValue !== val) {
      changeHandler({ [propName]: val, error: !!err });
    }
  }, [defaultValue]);

  const setValueError = (value: number | '', error: string): void => {
    setVal(value);
    setErr(error);
  };

  const handleChange = (event): void => {
    const target = event.target.value;
    const n = parseFloat(target);

    //Check if target is empty string
    if (target === empty) {
      setValueError(empty, empty);
      return;
    }

    //Checks if negative input
    if (target === '-') {
      setValueError(target, empty);
      return;
    }
    //Check if target is not a number
    if (isNaN(n)) {
      setValueError(empty, FormStrings.validateNumber);
      return;
    }

    if (!target && required) {
      setValueError(empty, FormStrings.isRequired);
      return;
    }

    if (isFunction(validate)) {
      setValueError(n, validate(n));
      return;
    }

    const newVal = target[target.length - 1] === '.' ? target : n;
    setValueError(newVal, empty);
  };

  // only update the parent when blur event is triggered, reducing rerenders
  const handleBlur = (): void => {
    let value = val;
    let error = err;
    if (!val && required) {
      value = empty;
      error = FormStrings.isRequired;
    }
    setValueError(value, error);
    changeHandler({ [propName]: value, error: !!error });
  };

  // will receive warnings if these are not deleted
  // note: removing 'type' prop to disable input number +-
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'defaultValue', 'type', 'style']);

  return (
    <TextField
      value={val ?? ''}
      size={'small'}
      style={{ ...style, ...baseInputStyle }}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={err}
      error={!!err}
      {...propsToPass}
    />
  );
}
