import { SelectProps, FormControl, InputLabel, Select as MUISelect, MenuItem, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';

export type SharedSelectProps = SelectProps & {
  defaultValue: string;
  triggerReset?: number | string | boolean;
};

type BasicSelectProps = SharedSelectProps & {
  values: string[];
  handleChange: (v: string) => void;
};

/**
 * a simple single select component that takes a list of values as a string array
 */
export default function Select({
  handleChange,
  label,
  values,
  triggerReset,
  sx,
  defaultValue = '',
  className = 'select-control-small'
}: BasicSelectProps): JSX.Element {
  const [selected, setSelected] = useState(defaultValue);

  useEffect(() => {
    setSelected(defaultValue);
  }, [triggerReset, defaultValue]);

  const onChange = (event: SelectChangeEvent<string>): void => {
    const val = event.target.value;
    setSelected(val);
    handleChange(val);
  };
  return (
    <FormControl className={className} size='small' sx={sx}>
      <InputLabel>{label}</InputLabel>
      <MUISelect onChange={onChange} value={selected} required={true}>
        {values.map((v, idx) => (
          <MenuItem key={`${idx}-${v}`} value={v}>
            {v}
          </MenuItem>
        ))}
      </MUISelect>
    </FormControl>
  );
}
