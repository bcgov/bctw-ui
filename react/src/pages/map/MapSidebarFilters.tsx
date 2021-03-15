import { IconButton, InputLabelProps } from '@material-ui/core';
import { Icon } from 'components/common';
import { PageProp } from 'components/component_interfaces';
import Button from 'components/form/Button';
import TextField from 'components/form/Input';
import { useState } from 'react';
import SelectCode from 'components/form/SelectCode';
import { ICodeFilter } from 'types/code';
import { MapRange } from 'types/map';
// import drawerStyles from 'components/sidebar/drawer_classes';

type SidebarFiltersProps = PageProp & {
  start: string;
  end: string;
  onChange: (r: MapRange, filters: ICodeFilter[]) => void;
};

/**
 *
 * @param props
 */
export default function MapSidebarFilters(props: SidebarFiltersProps): JSX.Element {
  const labelProps: InputLabelProps = { shrink: true };
  // const [open, setOpen] = useState<boolean>(true);
  // const classes = drawerStyles();
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [start, setStart] = useState<string>(props.start);
  const [end, setEnd] = useState<string>(props.end);

  // const handleCloseFilters = (): void => setOpen(o => !o);

  const changeDate = (event): void => {
    const key = Object.keys(event)[0];
    const val = event[key];
    if (key === 'tstart') {
      setStart(val);
    } else {
      setEnd(val);
    }
  };

  const changeFilter = (v: ICodeFilter[], ch: string): void => {
    setFilters((o) => {
      const notThisFilter = o.filter((prev) => prev.code_header !== ch);
      const ret = [...notThisFilter, ...v];
      return ret;
    });
  };

  const handleApplyFilters = (): void => {
    props.onChange({start, end}, filters);
  };

  const resetFilters = (): void => {
    setFilters([]);
    handleApplyFilters();
  }

  return (
    <div className='side-panel'>
      <div className={'side-panel-title'}>
        <h3>Filters</h3>
        <IconButton onClick={null}>
          <Icon icon='close'></Icon>
        </IconButton>
      </div>
      <div>
        <TextField
          label='Select Start Date'
          InputLabelProps={labelProps}
          type='date'
          defaultValue={start}
          propName='tstart'
          changeHandler={changeDate}
        />
      </div>
      <div>
        <TextField
          label='Select End Date'
          InputLabelProps={labelProps}
          type='date'
          defaultValue={end}
          propName='tend'
          changeHandler={changeDate}
        />
      </div>
      <div>
        <SelectCode
          multiple
          labelTitle={'Population'}
          codeHeader={'population_unit'}
          defaultValue={''}
          changeHandler={null}
          changeHandlerMultiple={(codes): void => changeFilter(codes, 'population_unit')}
        />
      </div>
      <div>
        <SelectCode
          multiple
          labelTitle={'Species'}
          codeHeader={'species'}
          defaultValue={''}
          changeHandler={null}
          changeHandlerMultiple={(codes): void => changeFilter(codes, 'species')}
        />
      </div>
      <div>
        <SelectCode
          multiple
          labelTitle={'Gender'}
          codeHeader={'sex'}
          defaultValue={''}
          changeHandler={null}
          changeHandlerMultiple={(codes): void => changeFilter(codes, 'sex')}
        />
      </div>
      <div>
        <Button onClick={handleApplyFilters}>Apply</Button>
        <Button onClick={resetFilters}>Reset</Button>
      </div>
      <pre>
        <ul>
          {filters.map((f) => {
            return (
              <li key={f.id}>
                {f.code_header}: {f.description}
              </li>
            );
          })}
        </ul>
      </pre>
    </div>
  );
}
