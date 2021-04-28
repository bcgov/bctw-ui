import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useEffect, useState } from 'react';
import { ISelectMultipleData } from './MultiSelect';

type IAutocompleteProps<T extends ISelectMultipleData> = {
  label: string;
  changeHandler: (o: T[]) => void;
  triggerReset?: boolean; // force unselect of all values
  data: T[];
};

export default function MultiSelect<T extends ISelectMultipleData>(props: IAutocompleteProps<T>): JSX.Element {
  const { label, data, triggerReset, changeHandler } = props;
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [triggerReset]);

  const handleChange = (event: React.ChangeEvent<{ unknown }>, value: (ISelectMultipleData)[]): void => {
    setSelected(value)
    changeHandler(value as T[]);
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
      getOptionLabel={(option: ISelectMultipleData): string => option?.displayLabel}
      renderInput={(params): JSX.Element => <TextField {...params} label={label} variant='outlined' />}
      onChange={handleChange}
    />
  );
}
