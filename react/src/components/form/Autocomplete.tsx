import { Chip, Autocomplete as MUIAutocomplete, TextField } from '@mui/material';
import { SxProps } from '@mui/system';
import { useEffect, useState } from 'react';
import { ISelectMultipleData } from './MultiSelect';

type IAutocompleteProps<T extends ISelectMultipleData> = {
  label: string;
  changeHandler: (o: T[], p?: string) => void;
  defaultValue?: T[];
  triggerReset?: number | string | boolean; // unselect of all values
  resetToDefaultValue?: boolean;
  data: T[];
  width?: number;
  tagLimit?: number;
  isMultiSearch?: boolean;
  hidden?: boolean;
  sx?: SxProps;
};

/**
 * component similar to MultiSelect, but fills the text input with
 * tag components when an option is selected
 */
export default function Autocomplete<T extends ISelectMultipleData>(props: IAutocompleteProps<T>): JSX.Element {
  const {
    label,
    data,
    triggerReset,
    changeHandler,
    resetToDefaultValue,
    defaultValue,
    width,
    tagLimit,
    isMultiSearch,
    hidden,
    sx
  } = props;
  const [selected, setSelected] = useState<T[]>([]);
  useEffect(() => {
    if (resetToDefaultValue) {
      setSelected(defaultValue ?? []);
    } else {
      setSelected([]);
    }
  }, [triggerReset]);

  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue);
    }
  }, []);

  const handleChange = (value: T[]): void => {
    setSelected(value ? value : []);
    changeHandler(value ? value : [], data[0]?.prop);
  };
  if (hidden) {
    return null;
  }
  return (
    <MUIAutocomplete
      value={selected}
      disableCloseOnSelect={isMultiSearch}
      autoComplete
      size='small'
      multiple
      sx={sx}
      style={{ width }}
      limitTags={tagLimit ?? 3}
      isOptionEqualToValue={(option, value): boolean => {
        if (Array.isArray(value) && !value?.length) {
          return false;
        }
        return option.id === value.id;
      }}
      // exclude selected values from the option list
      filterSelectedOptions={true}
      //options={filteredData.filter(d => selected.findIndex(s => s.id === d.id) === -1)}
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
            <Chip
              key={`${option.prop}-${option.id}`}
              label={option.displayLabel}
              size='small'
              {...getTagProps({ index })}
            />
          ));
      }}
      getOptionLabel={(option: ISelectMultipleData): string => option.displayLabel ?? ''}
      renderInput={(params): JSX.Element => <TextField {...params} label={label} />}
      onChange={(e, v): void => {
        handleChange(v as T[]);
      }}
    />
  );
}
