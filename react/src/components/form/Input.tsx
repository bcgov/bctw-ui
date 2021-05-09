import { StandardTextFieldProps, TextField as MuiTextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { InputChangeHandler } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';

interface ITextInputProps extends StandardTextFieldProps {
  propName: string;
  defaultValue: string;
  outline?: boolean;
  changeHandler: InputChangeHandler;
}

export const inputPropsToRemove = ['outline', 'propName', 'changeHandler', 'validate', 'errorMessage', 'handleChange', 'formType']

export default function TextField(props: ITextInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, outline, style } = props;

  useEffect(() => {
    const o = { [propName]: defaultValue };
    changeHandler(o);
  }, [defaultValue]);

  const propsToPass = removeProps(props, inputPropsToRemove);

  const handleChange = (event): void => {
    let o;
    if (typeof defaultValue === 'number') {
      o = { [propName]: +event.target.value };
    } else {
      o = { [propName]: event.target.value };
    }
    changeHandler(o);
  };

  return (
    <MuiTextField
      variant={outline ? 'outlined' : 'standard'}
      size={'small'}
      style={style ?? baseInputStyle}
      {...propsToPass}
      onChange={handleChange}
    />
  );
}
