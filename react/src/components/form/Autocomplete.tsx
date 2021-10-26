import { Chip, TextField } from '@mui/material';
import { Autocomplete as MUIAutocomplete } from '@mui/material';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useEffect, useState } from 'react';
import { ISelectMultipleData } from './MultiSelect';

type IAutocompleteProps<T extends ISelectMultipleData> = {
  label: string;
  changeHandler: (o: T[]) => void;
  defaultValue?: T;
  triggerReset?: boolean; // unselect of all values
  data: T[];
};

/**
 * component similar to MultiSelect, but fills the text input with 
 * tag components when an option is selected
 */
export default function Autocomplete<T extends ISelectMultipleData>(props: IAutocompleteProps<T>): JSX.Element {
  const { label, data, triggerReset, changeHandler, defaultValue } = props;
  const [selected, setSelected] = useState<T[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [triggerReset]);

  useDidMountEffect(() => {
    if (defaultValue) {
      setSelected(o => [...o, defaultValue]);
    }
  }, [defaultValue])

  const handleChange = (value: T[]): void => {
    setSelected(value);
    changeHandler(value);
  };

  return (
    <MUIAutocomplete
      value={selected}
      disableCloseOnSelect={true}
      autoComplete
      size='small'
      multiple
      limitTags={3}
      // exclude selected values from the option list
      options={data.filter(d => selected.findIndex(s => s.id === d.id) === -1)}
      renderTags={(value: T[], getTagProps): JSX.Element[] => {
        return value
          .sort((a, b) => {
            if (typeof a.id === 'number' && typeof b.id === 'number') {
              return a.id - b.id;
            }
            return -1;
          })
          .map((option: T, index: number) => (
            <Chip key={`${option.prop}-${option.id}`} label={option.displayLabel} {...getTagProps({ index })} />
          ));
      }}
      getOptionLabel={(option: ISelectMultipleData): string => option.displayLabel}
      renderInput={(params): JSX.Element => <TextField {...params} label={label} />}
      onChange={(e, v): void => handleChange(v as T[])}
    />
  );
}
