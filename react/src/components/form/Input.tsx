import { StandardTextFieldProps, TextField as MuiTextField } from '@material-ui/core';
import { baseInputStyle } from 'components/component_constants';
import { InputChangeHandler } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';
import {useState} from 'react';

interface ITextInputProps extends StandardTextFieldProps {
  propName: string;
  defaultValue: string;
  outline?: boolean;
  changeHandler: InputChangeHandler;
}

export const inputPropsToRemove = ['outline', 'propName', 'changeHandler', 'validate', 'errorMessage', 'handleChange', 'formType', 'defaultValue']

export default function TextField(props: ITextInputProps): JSX.Element {
  const { changeHandler, propName, defaultValue, outline, style } = props;
  const [val, setVal] = useState<string>(defaultValue ?? '');

  useEffect(() => {
    setVal(defaultValue ?? '');
    changeHandler({ [propName]: defaultValue });
  }, [defaultValue]);

  const propsToPass = removeProps(props, inputPropsToRemove);

  const handleChange = (event): void => {
    const target = event.target.value;
    setVal(target);
    changeHandler({ [propName]: target });
  };

  return (
    <MuiTextField
      variant={outline ? 'outlined' : 'standard'}
      size={'small'}
      style={style ?? baseInputStyle}
      value={val}
      onChange={handleChange}
      {...propsToPass}
    />
  );
}
