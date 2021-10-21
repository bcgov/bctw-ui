import { Chip, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from 'react';
import { ISelectMultipleData } from './MultiSelect';

type IAutocompleteProps<T extends ISelectMultipleData> = {
  label: string;
  changeHandler: (o: T[]) => void;
  triggerReset?: boolean; // unselect of all values
  data: T[];
};

export default function MultiSelect<T extends ISelectMultipleData>(props: IAutocompleteProps<T>): JSX.Element {
  const { label, data, triggerReset, changeHandler } = props;
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [triggerReset]);

  const handleChange = (value: T[]): void => {
    setSelected(value);
    changeHandler(value);
  };

  return (
    <Autocomplete
      value={selected}
      disableCloseOnSelect={true}
      autoComplete
      size='small'
      multiple
      limitTags={3}
      options={data}
      renderTags={(value: T[], getTagProps): JSX.Element[] => {
        return value
          .sort((a, b) => {
            if (typeof a.id === 'number' && typeof b.id === 'number') {
              return a.id - b.id;
            }
            return -1;
          })
          .map((option: T, index: number) => (
            <Chip variant='outlined' key={option.id} label={option.displayLabel} {...getTagProps({ index })} />
          ));
      }}
      getOptionLabel={(option: ISelectMultipleData): string => option.displayLabel}
      renderInput={(params): JSX.Element => <TextField {...params} label={label} variant='outlined' />}
      onChange={(e, v): void => handleChange(v)}
    />
  );
}
