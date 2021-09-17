import { StandardTextFieldProps, TextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { InputChangeHandler } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common_helpers';
import { useState } from 'react';
import { inputPropsToRemove } from 'components/form/TextInput';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';

/**
 * bug: why is key not being passed????????
 */
interface INumberInputProps extends StandardTextFieldProps {
  changeHandler: InputChangeHandler;
  defaultValue?: number;
  propName: string;
  validate?: (v: number) => string;
}

export default function NumberField(props: INumberInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, validate, required } = props;
  /**
   * consider -1 to be an invalid default value - probably used to make sure this
   * @param propName renders a @function numberField but is actually null
  */
  const [val, setVal] = useState(defaultValue === -1 ? '' : defaultValue);
  const [err, setErr] = useState<string>('');

  /**
   * when default value is changed
   * undefined values are sometimes cast to -1 to make sure the form compoent is
   * rendered as a number input. h
   */
  useEffect(() => {
    setVal(defaultValue === -1 ? '' : defaultValue);
    handleIsRequired(defaultValue);
  }, [defaultValue]);

  useDidMountEffect(() => {
    callParentHandler();
  }, [val, err]);

  // error handling triggered when val is changed
  useDidMountEffect(() => {
    let err = '';
    if (isNaN(val as number)) {
      callParentHandler();
      return;
    } 
    else if (typeof validate === 'function') {
      err = validate(val as number);
      setErr(err);
    }
  }, [val]);

  const callParentHandler = (): void => changeHandler({ [propName]: val, error: !!err });

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
      // note: setting val to undefined won't update state properly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setVal('' as any);
      setErr(FormStrings.validateNumber);
      return;
    }
    // parseFloat will remove the '.' if inputted individually.
    setVal(target[target.length - 1] === '.' ? target : n);
    handleIsRequired(target);
  };

  const handleIsRequired = (v: number): void => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    }
  }

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
