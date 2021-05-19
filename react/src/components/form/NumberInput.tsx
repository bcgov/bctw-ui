import { StandardTextFieldProps, TextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { InputChangeHandler } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';
import { useState } from 'react';
import { inputPropsToRemove } from './Input';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';

interface INumberInputProps extends StandardTextFieldProps {
  propName: string;
  changeHandler: InputChangeHandler;
  defaultValue?: number;
  validate?: (v: number) => string;
}

export default function NumberField(props: INumberInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, validate } = props;
  const [err, setErr] = useState<string>('');
  // consider -1 to be an invalid default value, as it was likely used to make sure this
  // prop uses a number field but is actually null
  const [val, setVal] = useState<number>(defaultValue === -1 ? undefined : defaultValue);

  useEffect(() => {
    const o = { [propName]: defaultValue, error: err };
    changeHandler(o);
  }, [defaultValue]);

  // error handling triggered when val is changed
  useDidMountEffect(() => {
    let err = '';
    if (isNaN(val)) {
      changeHandler({ [propName]: val, error: err });
      return;
    } 
    else if (typeof validate === 'function') {
      err = validate(val);
      setErr(err);
    }
    changeHandler({ [propName]: val, error: err });
  }, [val]);

  // will receive warnings if these are not deleted
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'defaultValue']);

  const handleChange = (event): void => {
    setErr('')
    const target = event.target.value;
    // allow the negative sign at the start of input
    if (target === '-') {
      setVal(target);
      return;
    }
    const n = parseFloat(target);
    if (isNaN(n)) {
      // note: setting val to undefined doesn't trigger useEffect
      setVal(0);
      setErr(FormStrings.validateNumber);
      return;
    }
    // parseFloat will remove the '.' if inputted individually.
    setVal(target[target.length - 1] === '.' ? target : n);
  };

  return (
    <TextField
      variant={'outlined'}
      size={props.size ?? 'small'}
      value={val}
      style={style ?? baseInputStyle}
      onChange={handleChange}
      helperText={err}
      // todo: style the error 
      // FormHelperTextProps={{variant: 'outlined'}}
      error={!!err}
      {...propsToPass}
    />
  );
}
