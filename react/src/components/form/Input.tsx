import { TextField as MuiTextField } from '@material-ui/core';
import { ITextfieldProps } from 'components/component_interfaces';
import { useEffect } from 'react';
import { removeProps } from 'utils/common';

export default function TextField(props: ITextfieldProps): JSX.Element {
  const { changeHandler, propName, defaultValue } = props;

  useEffect(() => {
    const o = { [propName]: defaultValue };
    changeHandler(o)
  }, [defaultValue]);

  const propsToPass = removeProps(props ,['propName', 'changeHandler']);
  
  return (
    <MuiTextField
      {...propsToPass}
      onChange={(event): void => {
        const o = { [propName]: event.target.value };
        changeHandler(o);
      }}
    />
  );
}
