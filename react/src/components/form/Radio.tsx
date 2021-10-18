import { useState, ReactElement, ChangeEvent, ReactNode } from 'react';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { FormBaseProps } from 'types/form_types';
import { Tooltip } from 'components/common';

type RadioProps = FormBaseProps & {
  defaultSelectedValue: string;
  values: { value: string; label: string; disabled?: boolean, tooltip?: ReactNode}[];
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
      {label ? <FormLabel>{label}</FormLabel> : null}
      <RadioGroup row aria-label='position' name='position' value={selectedValue} onChange={handleSelect}>
        {values.map((v) => {
          const { label, value, tooltip, disabled = false } = v;
          const comp = (
            <FormControlLabel
              key={`radio-${label}`}
              value={value}
              control={<Radio color='primary' />}
              label={label}
              labelPlacement={'end'}
              disabled={disabled}
            />
          );
          return tooltip ? <Tooltip title={tooltip}>{comp}</Tooltip> : comp;
        })}
      </RadioGroup>
    </FormControl>
  );
}
