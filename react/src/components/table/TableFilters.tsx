import { Box, TextField } from '@mui/material';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { columnToHeader } from 'utils/common_helpers';
import { ITableFilter } from './table_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { FormStrings } from 'constants/strings';
import useDebounce from 'hooks/useDebounce';
import AutoComplete from 'components/form/Autocomplete';
import { ROWS_PER_PAGE } from './DataTable';

type TextFilterProps = {
  rowCount: number;
  defaultFilter?: string;
  handleTextChange: (filter: string) => void;
  disabled?: boolean;
  inputRef?: MutableRefObject<any>;
};

type TableFilterProps<T> = {
  rowCount: number;
  filterableProperties: (keyof T)[];
  onChangeFilter: (filter: ITableFilter) => void;
  isMultiSearch?: boolean;
  setPage: (page: number) => void;
  disabled: boolean;
};


/**
 * the text input search/filter component
 */
function TextFilter({ disabled, rowCount, defaultFilter, handleTextChange, inputRef }: TextFilterProps): JSX.Element {
  const [term, setTerm] = useState(defaultFilter ?? '');
  const debouncedTerm = useDebounce(term, 800);

  useDidMountEffect(() => {
    if(!defaultFilter){
      setTerm(defaultFilter);
    }
  },[defaultFilter])

  useDidMountEffect(() => {
    handleTextChange(debouncedTerm.toLowerCase());
  }, [debouncedTerm]);

  return (
    <TextField
      className='table-filter-input'
      //defaultValue={term}
      onChange={(v): void => setTerm(v.target.value)}
      value={term}
      label={'Search'}
      placeholder={`${rowCount} records...`}
      disabled={disabled}
      size={'small'}
      inputRef={inputRef}
    />
  );
}


/**
 * the search component visible in table toolbars
 */
function TableFilter<T>(props: TableFilterProps<T>): JSX.Element {
  const { filterableProperties, onChangeFilter, rowCount, isMultiSearch, setPage, disabled } = props;
  const [selectedOption, setSelectedOption] = useState<string[] | null>(null);
  const [searchStr, setSearchStr] = useState('');
  const textInput = useRef(null);
  
  useDidMountEffect(() => {
    const n: ITableFilter = { keys: selectedOption, operator: 'contains', term: searchStr };
    onChangeFilter(n);
  }, [searchStr, selectedOption]);
  
  const handleSelect = (v: ISelectMultipleData[]): void => {
    const values = v.map((item) => item.value as keyof T);
    if(selectedOption && !values.length){
      setSearchStr('');
    }
    setSelectedOption(values as string[]);

    setTimeout(() => {
      textInput.current.focus();
    },100);

  };

  const handleTextChange = (value: string): void => {
    setSearchStr(value);
    setPage(1);
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
        isMultiSearch={isMultiSearch}
      />
      <TextFilter 
        rowCount={rowCount} 
        handleTextChange={handleTextChange} 
        defaultFilter={searchStr} 
        disabled={disabled && !selectedOption?.length}
        inputRef={textInput}
      />
    </Box>
  );
}

export default TableFilter;
