import { TextField as MuiTextField } from '@material-ui/core';
import { ITextfieldProps } from 'components/component_interfaces';
import { useEffect } from 'react';

export default function TextField(props: ITextfieldProps) {
  const { changeHandler, propName, defaultValue } = props;

  useEffect(() => {
    const o = { [propName]: defaultValue };
    changeHandler(o)
  }, [defaultValue]);

  const propsToPass = {...props};
  delete propsToPass.propName;
  delete propsToPass.changeHandler;
  
  return (
    <MuiTextField
      {...propsToPass}
      onChange={(event) => {
        const o = { [propName]: event.target.value };
        // console.log(o);
        changeHandler(o);
      }}
    />
  );
}
