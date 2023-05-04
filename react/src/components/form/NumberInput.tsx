import { StandardTextFieldProps, TextField } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import React, { MouseEvent, useEffect } from 'react';
import { removeProps } from 'utils/common_helpers';
import { useState } from 'react';
import { inputPropsToRemove } from 'components/form/TextInput';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';
import { FormBaseProps } from 'types/form_types';
import { isFunction } from 'components/table/table_helpers';
import { error } from 'console';

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
  const [err, setErr] = useState(empty);

  useEffect(() => {
    if (typeof defaultValue === 'number') {
      if (isFunction(validate)) {
        setValueError(defaultValue, validate(defaultValue));
        return;
      }
    }
    setVal(empty);
    //handleValidate(defaultValue);
    handleIsRequired(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (propName === 'temperature') console.log({ props });
  }, [err]);

  useDidMountEffect(() => {
    handleIsRequired(val);
  }, [required]);

  // will receive warnings if these are not deleted
  // note: removing 'type' prop to disable input number +-
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'defaultValue', 'type', 'style']);

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

    if (isFunction(validate)) {
      setValueError(n, validate(n));
      return;
    }

    const newVal = target[target.length - 1] === '.' ? target : n;
    setValueError(newVal, empty);
  };
  // const handleValidate = (v: number | ''): void => {};
  const handleIsRequired = (v: number | ''): void => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    }
  };

  // only update the parent when blur event is triggered, reducing rerenders
  const handleBlur = (): void => {
    // if (isTextboxEmpty) {
    //   setErr(noError);
    //   changeHandler({ [propName]: val, error: !!noError });
    //   return;
    // }
    callParentHandler();
  };

  const callParentHandler = (): void => {
    changeHandler({ [propName]: val, error: !!err });
  };

  return (
    <TextField
      value={val}
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
