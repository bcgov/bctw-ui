import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectProps } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

export interface ISelectMultipleData {
  id: string | number;
  value: string | number;
}

type ISelectMultipleProps<T extends ISelectMultipleData> = SelectProps & {
  label: string;
  renderTypeLabel: string; // what to show when multiple are selected
  changeHandler: (o: T[]) => void;
  triggerReset?: boolean; // force unselect of all values
  data: T[];
};

const selectAll = { id: -1, value: 'Select All' };

export default function MultiSelect<T extends ISelectMultipleData>(props: ISelectMultipleProps<T>): JSX.Element {
  const { label, data, triggerReset, changeHandler, renderTypeLabel } = props;
  // will be a string[] or number[]
  const [selected, setSelected] = useState([]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const s = event.target.value;
    if (s === selectAll.value) {
      return;
    }
    const newSelected = data.filter((d) => s.includes(d.value));
    setSelected(newSelected.map((a) => a.value));
    changeHandler(newSelected);
  };

  const handleCheckSelectAll = (item: T, checked: boolean): void => {
    if (item.id !== selectAll.id) {
      return;
    }
    if (checked) {
      const all = [selectAll.value, ...data.map((d) => d.value)];
      setSelected(all);
    } else {
      setSelected([]);
    }
  };

  useEffect(() => {
    setSelected([]);
  }, [triggerReset]);

  return (
    <FormControl size='small' variant={'outlined'} className={'select-control'}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={true}
        variant={'outlined'}
        value={selected}
        onChange={handleChange}
        renderValue={(): string => (selected.length ? `${selected.length} ${renderTypeLabel} selected` : null)}>
        {[...[selectAll], ...data].map((d: T) => {
          return (
            <MenuItem key={d.id} value={d.value}>
              <Checkbox
                size='small'
                color='primary'
                checked={selected.includes(d.value)}
                onChange={(e, checked): void => handleCheckSelectAll(d, checked)}
              />
              {d.value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
