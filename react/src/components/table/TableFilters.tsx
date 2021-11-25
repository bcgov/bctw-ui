import { Box, TextField } from '@mui/material';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import { useMemo, useState } from 'react';
import { columnToHeader } from 'utils/common_helpers';
import { ITableFilter } from './table_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';
import useDebounce from 'hooks/useDebounce';
import AutoComplete from 'components/form/Autocomplete';

type TextFilterProps = {
  rowCount: number;
  defaultFilter?: string;
  setGlobalFilter: (filter: string) => void;
  disabled?: boolean;
};

/**
 * the text input search/filter component
 */
function TextFilter({ disabled, rowCount, defaultFilter, setGlobalFilter }: TextFilterProps): JSX.Element {
  const [term, setTerm] = useState(defaultFilter);
  const debouncedTerm = useDebounce(term, 800);

  useDidMountEffect(() => {
    setGlobalFilter(debouncedTerm);
  }, [debouncedTerm])

  return (
    <TextField
      className='table-filter-input'
      defaultValue={term}
      onChange={(v): void => setTerm(v.target.value)}
      label={'Search'}
      placeholder={`${rowCount} records...`}
      disabled={disabled}
      size={'small'}
    />
  );
}

type TableFilterProps<T> = {
  rowCount: number;
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
};

/**
 * the search component visible in table toolbars
 */
function TableFilter<T>(props: TableFilterProps<T>): JSX.Element {
  const { filterableProperties, onChangeFilter, rowCount } = props;
  const [selectedOption, setSelectedOption] = useState<string[]>();
  const [searchStr, setSearchStr] = useState('');

  useDidMountEffect(() => {
    const n: ITableFilter = { keys: selectedOption, operator: 'contains', term: searchStr };
    onChangeFilter(n);
  }, [searchStr, selectedOption]);

  const handleSelect = (v: ISelectMultipleData[]): void => {
    const values = v.map((item) => item.value as keyof T);
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
    <Box display='flex' alignItems='center' columnGap={1}>
      <AutoComplete
        label={FormStrings.filterColumnsLabel}
        data={selectOptions}
        changeHandler={handleSelect}
        tagLimit={1}
        width={300}
      />
      <TextFilter rowCount={rowCount} setGlobalFilter={handleTextChange} />
    </Box>
  );
}

export default TableFilter;
