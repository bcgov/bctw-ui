import { useEffect, useState } from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps, FormControlLabelProps } from '@mui/material/';
import { FormControlLabel } from '@mui/material';
import { removeProps } from 'utils/common_helpers';
import { inputPropsToRemove } from 'components/form/TextInput';
import { FormBaseProps } from 'types/form_types';

type ICheckboxProps = Omit<FormBaseProps, 'changeHandler'> & CheckboxProps & Pick<FormControlLabelProps, 'labelPlacement'> & {
  initialValue: boolean;
  changeHandler: (o: Record<string, boolean>) => void;
}

export default function Checkbox(props: ICheckboxProps): JSX.Element {
  const { initialValue, label, changeHandler, propName, labelPlacement } = props;

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
  const propsToPass = removeProps(props, [...inputPropsToRemove, 'initialValue', 'labelPlacement', 'style']);

  return (
    <>
      <FormControlLabel
        labelPlacement={labelPlacement} 
        control={
          <MuiCheckbox
            style={labelPlacement === 'start' ? {marginRight: '1rem'} : {}}
            size='small'
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