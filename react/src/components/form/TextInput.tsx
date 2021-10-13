import { StandardTextFieldProps, TextField as MuiTextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { useEffect } from 'react';
import { removeProps } from 'utils/common_helpers';
import {useState} from 'react';
import { mustBeEmail } from 'components/form/form_validators';
import { FormStrings } from 'constants/strings';
import { FormBaseProps } from 'types/form_types';

export type TextInputProps = FormBaseProps & StandardTextFieldProps & {
  defaultValue: string;
}

export const inputPropsToRemove = ['propName', 'changeHandler', 'validate', 'errorMessage', 'handleChange', 'formType', 'defaultValue']

export default function TextField(props: TextInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, required } = props;
  const [val, setVal] = useState<string>(defaultValue ?? '');
  const [err, setErr] = useState<string>('');

  // update when defaultValue is changed
  useEffect(() => {
    const n = defaultValue ?? '';
    setVal(n);
    handleIsRequired(n);
  }, [defaultValue]);

  // pass changes to parent handler when focus is lost
  const handleBlur = ():void => {
    callParentHandler();
  }

  const handleChange = (event): void => {
    const target = event.target.value;
    setErr('');
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
    }
  }

  const handleChangeEmail = (email: string): void => {
    // will be empty if the validation succeeded
    const msg = mustBeEmail(email);
    setErr(msg);
  }

  const callParentHandler = (): void => changeHandler({ [propName]: val, error: !!err.length });

  const propsToPass = removeProps(props, inputPropsToRemove);

  return (
    <MuiTextField
      variant={'outlined'}
      size={'small'}
      style={style ?? baseInputStyle}
      value={val}
      onBlur={handleBlur}
      onChange={handleChange}
      {...propsToPass}
      error={!!err}
      helperText={err}
    />
  );
}
