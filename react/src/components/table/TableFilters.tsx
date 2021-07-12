import { IconButton } from '@material-ui/core';
import MultiSelect, { ISelectMultipleData } from 'components/form/MultiSelect';
import TextField from 'components/form/TextInput';
import { useMemo, useState } from 'react';
import { columnToHeader } from 'utils/common_helpers';
import FilterListIcon from '@material-ui/icons/FilterList';
import { ITableFilter } from './table_interfaces';
import { Tooltip } from 'components/common';

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
  const [value, setValue] = useState<string>(defaultFilter);
  const propName = 'search';

  const handleChange = (v): void => {
    const value = v[propName];
    setValue(value);
    setGlobalFilter(value);
  };
  return (
    <TextField
      defaultValue={value}
      changeHandler={handleChange}
      label={'Search'}
      placeholder={`${rowCount} records...`}
      propName={propName}
      disabled={disabled}
    />
  );
}

type TableFilterProps<T> = {
  rowCount: number;
  filterableProperties: string[];
  onChangeFilter: (filter: ITableFilter) => void;
};

/**
 * the main search component visible in table toolbars
 */
function TableFilter<T>(props: TableFilterProps<T>): JSX.Element {
  const { filterableProperties, onChangeFilter, rowCount } = props;
  const [selectedOption, setSelectedOption] = useState<string[]>();
  const [showFilter, setShowFilter] = useState(true);

  const handleSelect = (v: ISelectMultipleData[]): void => {
    const values = v.map(item => item.value as keyof T);
    setSelectedOption(values as any)
  };

  const handleTextChange = (value: string): void => {
    const n: ITableFilter = { keys: selectedOption, operator: 'contains', term: value }
    onChangeFilter(n);
  };

  // minimize re-rendering
  // from the headers, generate the values of the dropdown options
  const selectOptions = useMemo(
    () =>
      filterableProperties.map((f, i) => {
        return {
          id: i,
          value: f,
          displayLabel: columnToHeader(f)
        } as ISelectMultipleData;
      }),
    []
  );

  return (
    <>
      {showFilter ? (
        <div style={{ display: 'flex', flexDirection: 'row', maxWidth: '350px' }}>
          <MultiSelect renderValue={(v: string[]): string => `${v.length} selected`} label={'Columns'} data={selectOptions} changeHandler={handleSelect} />
          <div style={{width: '10px'}}></div>
          <TextFilter
            rowCount={rowCount}
            setGlobalFilter={handleTextChange}
          />
        </div>
      ) : null}
      <Tooltip title={ `${showFilter ? 'Hide' : 'Show'} Filter Controls`} >
        <IconButton onClick={(): void => setShowFilter((o) => !o)} aria-label='filter list'>
          <FilterListIcon htmlColor='#90caf9' />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default TableFilter;
