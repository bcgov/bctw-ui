import { useEffect, useState } from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps } from '@material-ui/core/';
import { FormControlLabel } from '@material-ui/core';
import { removeProps } from 'utils/common_helpers';
import { inputPropsToRemove } from 'components/form/TextInput';
import { FormBaseProps } from 'types/form_types';

type ICheckboxProps = Omit<FormBaseProps, 'changeHandler'> & CheckboxProps & {
  initialValue: boolean;
  changeHandler: (o: Record<string, boolean>) => void;
}

export default function Checkbox(props: ICheckboxProps): JSX.Element {
  const { initialValue, label, changeHandler, propName } = props;

  // default to false for cases when initialValue is null to avoid react error about uncontrolled state
  const [checked, setChecked] = useState(initialValue ?? false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = event.target.checked;
    setChecked(checked);
    changeHandler({[propName]: checked });
  };

  // rerender if the default was changed
  useEffect(() => {
    if (typeof initialValue === 'boolean') {
      setChecked(initialValue);
    }
  }, [initialValue]);

  // passing props that dont belong in dom is throwing errors
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'initialValue']);

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
        label={label}
      />
    </>
  );
}