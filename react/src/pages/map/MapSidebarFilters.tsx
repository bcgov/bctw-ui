import { Divider, Drawer, IconButton, InputLabelProps } from '@material-ui/core';
import { FilterList, Close } from '@material-ui/icons';
import { PageProp } from 'components/component_interfaces';
import clsx from 'clsx';
import Button from 'components/form/Button';
import TextField from 'components/form/Input';
import { useState } from 'react';
import SelectCode from 'components/form/SelectCode';
import { ICodeFilter } from 'types/code';
import { MapRange } from 'types/map';
import drawerStyles from 'components/sidebar/drawer_classes';

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
  const [open, setOpen] = useState<boolean>(true);
  const classes = drawerStyles();
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [start, setStart] = useState<string>(props.start);
  const [end, setEnd] = useState<string>(props.end);
  const [reset, setReset] = useState<boolean>(false);

  const [applyButtonDisabledStatus, setApplyButtonDisabledStatus] = useState<boolean>(true);

  const changeDate = (event): void => {
    const key = Object.keys(event)[0];
    const val = event[key];
    if (key === 'tstart') {
      setStart(val);
    } else {
      setEnd(val);
    }
  };

  /**
   * handler for when a select component is changed
   * @param v value passed from select component
   * @param ch the code header
   */
  const changeFilter = (v: ICodeFilter[], ch: string): void => {
    setApplyButtonDisabledStatus(false);
    setFilters((o) => {
      const notThisFilter = o.filter((prev) => prev.code_header !== ch);
      const ret = [...notThisFilter, ...v];
      return ret;
    });
  };

  /**
   *
   * @param event the button click event
   * @param reset force calling the parent handler with empty array
   */
  const handleApplyFilters = (event: React.MouseEvent<HTMLInputElement>, reset = false): void => {
    props.onChange({ start, end }, reset ? [] : filters);
  };

  /**
   * 1) resets the filters state
   * 2) triggers selects to unselect all menu items
   * 3) updates apply button enabled status
   */
  //
  const resetFilters = (): void => {
    setApplyButtonDisabledStatus(true);
    // fixme: ugly
    setReset(true);
    setTimeout(() => setReset(false), 1000);

    setFilters([]);
    // since setFilters is async, call handleApplyFilters with an empty filter array
    handleApplyFilters(null, true);
  };

  const codeFilters = [
    { header: 'population_unit', label: 'Population' },
    { header: 'species', label: 'Species' },
    { header: 'sex', label: 'Gender' }
  ];

  const createMultiSelects = (): React.ReactNode => {
    return codeFilters.map((cf, idx) => (
      <div key={`${cf.header}-${idx}`}>
        <SelectCode
          multiple
          labelTitle={cf.label}
          codeHeader={cf.header}
          changeHandler={null}
          changeHandlerMultiple={(codes): void => changeFilter(codes, cf.header)}
          triggerReset={reset}
        />
      </div>
    ));
  };

  const handleDrawerOpen = () => {
    setOpen((o) => !o);
  };

  return (
    <div className={'side-panel'}>
      <Drawer
        variant='permanent'
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}>
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerOpen}>{open ? <Close /> : <FilterList />}</IconButton>
        </div>
        {open ? (
          <>
            <div className={'side-panel-title'}>
              <h3>Filters</h3>
            </div>
            <div className='side-panel-body'>
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
              {createMultiSelects()}
              <div>
                <Button disabled={applyButtonDisabledStatus} onClick={handleApplyFilters}>
                  Apply
                </Button>
                <Button onClick={resetFilters}>Reset</Button>
              </div>
              <p>{filters.length} filters</p>
              {/* <ul>
                {filters.map((f) => {
                  return (
                    <li key={f.id}>
                      {f.code_header}: {f.description}
                    </li>
                  );
                })}
              </ul> */}
            </div>
          </>
        ) : (
          <></>
        )}
      </Drawer>
    </div>
  );
}
