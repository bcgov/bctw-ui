import { SelectProps, FormControl, InputLabel, Select as MUISelect, MenuItem } from '@material-ui/core';
import { useState } from 'react';

type BasicSelectProps = SelectProps & {
  values: string[];
  defaultValue: string;
  handleChange: (v: string) => void;
};

/**
 * a simple single select component that takes a list of values as a string array
 */
export default function Select({handleChange, defaultValue, label, values }: BasicSelectProps): JSX.Element {
  const [selected, setSelected] = useState(defaultValue ?? '');

  const onChange = (event: React.ChangeEvent<{ value }>): void => {
    const val = event.target.value;
    setSelected(val);
    handleChange(val);
  };

  return (
    <FormControl className={'select-control-small'} variant={'outlined'}>
      <InputLabel>{label}</InputLabel>
      <MUISelect onChange={onChange} value={selected} variant={'outlined'} required={true}>
        {values.map((v, idx) => (
          <MenuItem key={`${idx}-${v}`} value={v}>
            {v}
          </MenuItem>
        ))}
      </MUISelect>
    </FormControl>
  );
}
