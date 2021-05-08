import { TextField as MuiTextField } from '@material-ui/core';
import { ITextfieldProps } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';

const baseStyle = { marginRight: '10px', width: '200px' };
export default function TextField(props: ITextfieldProps): JSX.Element {
  const { changeHandler, propName, defaultValue, outline, style } = props;

  useEffect(() => {
    const o = { [propName]: defaultValue };
    changeHandler(o);
  }, [defaultValue]);

  const propsToPass = removeProps(props, ['propName', 'changeHandler', 'outline']);

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
      size='small'
      style={style ?? baseStyle}
      {...propsToPass}
      onChange={handleChange}
    />
  );
}
