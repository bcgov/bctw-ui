import { Box, TextField } from '@material-ui/core';
import MultiSelect, { ISelectMultipleData } from 'components/form/MultiSelect';
import { useMemo, useState } from 'react';
import { columnToHeader } from 'utils/common_helpers';
import { ITableFilter } from './table_interfaces';
import { FormStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';

type TextFilterProps = {
  rowCount: number;
  defaultFilter?: string;
  setGlobalFilter: (filter: string) => void;
  disabled?: boolean;
};

/**
 * the text input search/filter component
 */
function TextFilter({
  disabled,
  rowCount,
  defaultFilter,
  setGlobalFilter,
}: TextFilterProps): JSX.Element {
  const [value, setValue] = useState(defaultFilter);

  const handleChange = (v): void => {
    const value = v.target.value;
    setValue(value);
    setGlobalFilter(value);
  };
  return (
    <TextField
      className='table-filter-input'
      defaultValue={value}
      onChange={handleChange}
      label={'Search'}
      placeholder={`${rowCount} records...`}
      disabled={disabled}
      size={'small'}
      variant={'outlined'}
    />
  );
}

type TableFilterProps<T> = {
  rowCount: number;
  // filterableProperties: string[];
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
};

/**
 * the main search component visible in table toolbars
 */
function TableFilter<T>(props: TableFilterProps<T>): JSX.Element {
  const { filterableProperties, onChangeFilter, rowCount } = props;
  const [selectedOption, setSelectedOption] = useState<string[]>();
  const [searchStr, setSearchStr] = useState('');

  useDidMountEffect(() => {
    const n: ITableFilter = { keys: selectedOption, operator: 'contains', term: searchStr};
    onChangeFilter(n);
  }, [searchStr, selectedOption])

  const handleSelect = (v: ISelectMultipleData[]): void => {
    const values = v.map(item => item.value as keyof T);
    setSelectedOption(values as string[]);
  };

  const handleTextChange = (value: string): void => {
    setSearchStr(value);
  };

  // useMemo to minimize re-rendering
  // from the headers, generate the values of the dropdown options
  const selectOptions = useMemo(
    () =>
      filterableProperties.map((f, i) => {
        return {
          id: i,
          value: f,
          displayLabel: columnToHeader(f as string)
        } as ISelectMultipleData;
      }),
    []
  );


  return (
    <Box display="flex" alignItems="center" width="100%">
      <TextFilter
        rowCount={rowCount}
        setGlobalFilter={handleTextChange}
      />
      <MultiSelect renderValue={(v: string[]): string => `${v.length} selected`} label={FormStrings.filterColumnsLabel} data={selectOptions} changeHandler={handleSelect} />
    </Box>
  );

  {/* <Tooltip title={ `${showFilter ? 'Hide' : 'Show'} Filter Controls`} >
    <IconButton onClick={(): void => setShowFilter((o) => !o)} aria-label='filter list'>
      <FilterListIcon htmlColor='#90caf9' />
    </IconButton>
  </Tooltip> */}
}

export default TableFilter;
