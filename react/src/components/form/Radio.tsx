import { useState, ReactElement, ChangeEvent } from 'react';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core';
import { FormBaseProps } from 'types/form_types';

type RadioProps = FormBaseProps & {
  defaultSelectedValue: string;
  values: { value: string; label: string, disabled?: boolean }[];
};

export default function RadioField({
  changeHandler,
  propName,
  defaultSelectedValue,
  values,
  label
}: RadioProps): ReactElement {
  const [selectedValue, setSelectedValue] = useState(defaultSelectedValue);

  const handleSelect = (event: ChangeEvent<HTMLInputElement>, value: string): void => {
    setSelectedValue(value);
    changeHandler({ [propName]: value });
  };

  return (
    <FormControl component='fieldset'>
      {label ? ( <FormLabel>{label}</FormLabel>) : null}
      <RadioGroup row aria-label='position' name='position' value={selectedValue} onChange={handleSelect}>
        {values.map((v) => {
          const { label, value, disabled = false } = v;
          return (
            <FormControlLabel
              key={`radio-${label}`}
              value={value}
              control={<Radio color='primary' />}
              label={label}
              labelPlacement='start'
              disabled={disabled}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
