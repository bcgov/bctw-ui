import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectProps } from '@material-ui/core';
import { useEffect, useState } from 'react';

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

export default function MultiSelect<T extends ISelectMultipleData>(props: ISelectMultipleProps<T>): JSX.Element {
  const { label, data, triggerReset, changeHandler, renderTypeLabel } = props;
  // will be a string[] or number[]
  const [selected, setSelected] = useState([]);

  const handleChange = (event: React.ChangeEvent<{ value }>): void => {
    const s = event.target.value;
    const newSelected = data.filter(d => s.includes(d.value));
    setSelected(newSelected.map(a => a.value));
    changeHandler(newSelected);
  }

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
        renderValue={(): string => selected.length ? `${selected.length} ${renderTypeLabel} selected` : null}
      >
        {data.map((d) => {
          return (
            <MenuItem key={d.id} value={d.value}>
              <Checkbox size='small' color='primary' checked={selected.includes(d.value)}/>
              {d.value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
