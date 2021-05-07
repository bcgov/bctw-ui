import React, { useEffect, useState } from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps } from '@material-ui/core/';
import { FormControlLabel } from '@material-ui/core';
import { CheckBoxChangeHandler } from 'components/component_interfaces';
import { columnToHeader, removeProps } from 'utils/common';

interface ICheckboxProps extends CheckboxProps {
  initialValue: boolean;
  label: string;
  propName?: string;
  changeHandler: CheckBoxChangeHandler;
}
export default function Checkbox(props: ICheckboxProps): JSX.Element {
  const { initialValue, label, changeHandler, propName } = props;

  const [checked, setChecked] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    setChecked(checked);
    changeHandler({[propName ?? label]: checked });
  };

  // rerender if the default was changed
  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);

  // passing props that dont belong in dom is throwing errors
  const propsToPass = removeProps(props, ['changeHandler', 'initialValue']);

  return (
    <>
      <FormControlLabel
        control={
          <MuiCheckbox
            size='small'
            color='primary'
            checked={checked}
            onChange={handleChange}
            {...propsToPass}
          />
        }
        label={columnToHeader(label)}
      />
    </>
  );
}