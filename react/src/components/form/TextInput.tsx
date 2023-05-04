import { StandardTextFieldProps, TextField as MuiTextField } from '@mui/material';
import { baseInputProps, baseInputStyle } from 'components/component_constants';
import { useEffect } from 'react';
import { removeProps } from 'utils/common_helpers';
import { useState } from 'react';
import { mustBeEmail } from 'components/form/form_validators';
import { FormStrings } from 'constants/strings';
import { FormBaseProps } from 'types/form_types';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { isFunction } from 'components/table/table_helpers';

export type TextInputProps = FormBaseProps &
  StandardTextFieldProps & {
    defaultValue: string;
    validate?: (v: string) => string;
  };

export const inputPropsToRemove = [
  'propName',
  'changeHandler',
  'validate',
  'errorMessage',
  'handleChange',
  'formType',
  'defaultValue'
];

export default function TextField(props: TextInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, required, validate } = props;
  const [val, setVal] = useState(defaultValue ?? '');
  const [err, setErr] = useState('');
  const empty = '';

  // update when defaultValue is changed
  useEffect(() => {
    const n = defaultValue ?? empty;
    if (n !== empty) {
      if (isFunction(validate)) {
        setErr(validate(n));
      }
    }
    setVal(n);
    handleIsRequired(n);
  }, [defaultValue]);

  useDidMountEffect(() => {
    callParentHandler();
  }, [err]);

  // pass changes to parent handler when focus is lost
  const handleBlur = (): void => {
    callParentHandler();
  };

  const handleChange = (event): void => {
    const target = event.target.value;
    setErr(empty);
    setVal(target);

    if (String(propName).toLowerCase().includes('email')) {
      handleChangeEmail(target);
      return;
    }
    handleIsRequired(target);
  };

  const handleIsRequired = (v: string): void => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    } else if (!!v && required) {
      setErr(empty);
    }
  };

  const handleChangeEmail = (email: string): void => {
    // will be empty if the validation succeeded
    const msg = mustBeEmail(email);
    setErr(msg);
  };

  const callParentHandler = (): void => changeHandler({ [propName]: val, error: !!err.length });

  const propsToPass = {
    ...baseInputProps,
    ...removeProps(props, [...inputPropsToRemove, 'style'])
  };

  return (
    <MuiTextField
      style={{ ...baseInputStyle, ...style }}
      value={val}
      onBlur={handleBlur}
      onChange={handleChange}
      {...propsToPass}
      error={!!err}
      // fixme: email validation error missing.
      // helperText={err}
    />
  );
}
