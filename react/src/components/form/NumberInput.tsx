import { StandardTextFieldProps, TextField } from '@mui/material';
import { baseInputStyle } from 'components/component_constants';
import { useEffect } from 'react';
import { removeProps } from 'utils/common_helpers';
import { useState } from 'react';
import { inputPropsToRemove } from 'components/form/TextInput';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';
import { FormBaseProps } from 'types/form_types';

type NumberInputProps = FormBaseProps & StandardTextFieldProps & {
  defaultValue?: number;
  validate?: (v: number) => string;
}

/**
 * 
 */
export default function NumberField(props: NumberInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, validate, required } = props;

  const [val, setVal] = useState<number | ''>(typeof defaultValue === 'number' ? defaultValue : '');
  const [err, setErr] = useState('');

  useEffect(() => {
    setVal(typeof defaultValue === 'number' ? defaultValue : '');
    handleIsRequired(defaultValue);
  }, [defaultValue]);

  useDidMountEffect(() => {
    handleIsRequired(val);
  }, [required])

  useDidMountEffect(() => {
    callParentHandler();
  }, [val, err]);

  // only update the parent when blur event is triggered, reducing rerenders
  const handleBlur = (): void => {
    let err = '';
    if (isNaN(val as number)) {
      callParentHandler();
      return;
    } 
    else if (typeof validate === 'function') {
      err = validate(val as number);
      setErr(err);
    }
    callParentHandler();
  }

  const callParentHandler = (): void => changeHandler({ [propName]: val, error: !!err });

  // will receive warnings if these are not deleted
  // note: removing 'type' prop to disable input number +-
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'defaultValue', 'type', 'style']);

  const handleChange = (event): void => {
    setErr('')
    const target = event.target.value;
    // allow the - sign at the start of input
    if (target === '-') {
      setVal(target);
      return;
    }
    const n = parseFloat(target);
    if (isNaN(n)) {
      setVal('');
      setErr(FormStrings.validateNumber);
      return;
    }
    // parseFloat will remove the '.' if inputted individually.
    setVal(target[target.length - 1] === '.' ? target : n);
    handleIsRequired(target);
  };

  const handleIsRequired = (v: number | ''): void => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    } else {
      setErr('')
    }
  }

  return (
    <TextField
      value={val}
      size={'small'}
      style={{...style, ...baseInputStyle}}
      onChange={handleChange}
      onBlur={handleBlur}
      helperText={err}
      error={!!err}
      {...propsToPass}
    />
  );
}
