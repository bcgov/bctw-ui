import { StandardTextFieldProps, TextField } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { useEffect } from 'react';
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

  const [val, setVal] = useState<number | ''>(typeof defaultValue === 'number' ? defaultValue : '');
  const [err, setErr] = useState('');
  const isTextboxEmpty = val === '';
  const noError = '';
  // useEffect(() => {
  //   console.log({ err }, { val });
  // }, [err, val]);

  useEffect(() => {
    setVal(typeof defaultValue === 'number' ? defaultValue : '');
    handleIsRequired(defaultValue);
  }, [defaultValue]);

  useDidMountEffect(() => {
    handleIsRequired(val);
  }, [required]);

  // useDidMountEffect(() => {
  //   callParentHandler();
  // }, [err]);

  // will receive warnings if these are not deleted
  // note: removing 'type' prop to disable input number +-
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'defaultValue', 'type', 'style']);

  const handleChange = (event): void => {
    const target = event.target.value;
    const n = parseFloat(target);
    let error = noError;
    // allow the - sign at the start of input
    if (target === '-') {
      setVal(target);
      return;
    }

    if (isNaN(n)) {
      setVal('');
      setErr(FormStrings.validateNumber);
      return;
    } else if (isFunction(validate)) {
      error = validate(n);
      // setErr(error);
    }
    const newVal = target[target.length - 1] === '.' ? target : n;
    // parseFloat will remove the '.' if inputted individually.
    setVal(newVal);
    setErr(error);
    handleIsRequired(target);
  };

  const handleIsRequired = (v: number | ''): void => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    }
  };
  // only update the parent when blur event is triggered, reducing rerenders
  const handleBlur = (): void => {
    const error = noError;
    if (isTextboxEmpty) {
      setErr(error);
    }
    changeHandler({ [propName]: val, error: !!error });
    // callParentHandler();
    // let error = '';
    // if (isTextboxEmpty) {
    //   setErr(error);
    // } else if (isFunction(validate)) {
    //   error = validate(val as number);
    //   setErr(error);
    // }
    // callParentHandler();
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
