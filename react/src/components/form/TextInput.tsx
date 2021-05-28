import { StandardTextFieldProps, TextField as MuiTextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { InputChangeHandler } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';
import {useState} from 'react';
import { mustBeEmail } from 'components/form/form_validators';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';

interface ITextInputProps extends StandardTextFieldProps {
  propName: string;
  defaultValue: string;
  changeHandler: InputChangeHandler;
}

export const inputPropsToRemove = ['propName', 'changeHandler', 'validate', 'errorMessage', 'handleChange', 'formType', 'defaultValue']

export default function TextField(props: ITextInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, style, required } = props;
  const [val, setVal] = useState<string>(defaultValue ?? '');
  const [err, setErr] = useState<string>('');

  // update when defaultValue is changed
  useEffect(() => {
    const n = defaultValue ?? '';
    setVal(n);
    handleIsRequired(n);
  }, [defaultValue]);

  // pass changes to parent handler when the value or error status changes
  useDidMountEffect(() => {
    callParentHandler();
  }, [val, err])

  const handleChange = (event): void => {
    const target = event.target.value;
    setErr('');
    setVal(target);

    if (propName.toLowerCase().includes('email')) {
      handleChangeEmail(target);
      return;
    } 
    handleIsRequired(target);
  };

  const handleIsRequired = (v: string) => {
    if (!v && required) {
      setErr(FormStrings.isRequired);
    }
  }

  const handleChangeEmail = (email: string): void => {
    // will be empty if the validation succeeded
    const msg = mustBeEmail(email);
    setErr(msg);
  }

  const callParentHandler = (): void => changeHandler({ [propName]: val, hasError: !!err.length });

  const propsToPass = removeProps(props, inputPropsToRemove);

  return (
    <MuiTextField
      variant={'outlined'}
      size={'small'}
      style={style ?? baseInputStyle}
      value={val}
      onChange={handleChange}
      {...propsToPass}
      error={!!err}
      helperText={err}
    />
  );
}
