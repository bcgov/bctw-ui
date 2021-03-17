import { Drawer, IconButton, InputLabelProps } from '@material-ui/core';
import { FilterList, Close } from '@material-ui/icons';
import { PageProp } from 'components/component_interfaces';
import clsx from 'clsx';
import Button from 'components/form/Button';
import TextField from 'components/form/Input';
import { useEffect, useState } from 'react';
import SelectCode from 'components/form/SelectCode';
import { ICodeFilter } from 'types/code';
import { MapRange } from 'types/map';
import drawerStyles from 'components/sidebar/drawer_classes';
import Checkbox from 'components/form/Checkbox';

type MapFiltersProps = PageProp & {
  start: string;
  end: string;
  onApplyFilters: (r: MapRange, filters: ICodeFilter[]) => void;
  onShowLatestPings: (b: boolean) => void;
};

export default function MapFilters(props: MapFiltersProps): JSX.Element {
  const labelProps: InputLabelProps = { shrink: true };
  const [open, setOpen] = useState<boolean>(true);
  const classes = drawerStyles();
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [numFiltersSelected, setNumFiltersSelected] = useState<number>(0);
  const [start, setStart] = useState<string>(props.start);
  const [end, setEnd] = useState<string>(props.end);
  const [reset, setReset] = useState<boolean>(false);
  const [applyButtonDisabledStatus, setApplyButtonDisabledStatus] = useState<boolean>(true);
  const [isLatestPing, setIsLatestPing] = useState<boolean>(false);

  useEffect(() => {
    setNumFiltersSelected(filters.length);
  }, [filters]);

  const changeDate = (event): void => {
    const key = Object.keys(event)[0];
    const val = event[key];
    if (key === 'tstart') {
      setStart(val);
    } else {
      setEnd(val);
    }
    setApplyButtonDisabledStatus(false);
  };

  /**
   * handler for when a select component is changed
   * @param filters array passed from multi-select component
   * @param code_header the code header
   */
  const changeFilter = (filters: ICodeFilter[], code_header: string): void => {
    setApplyButtonDisabledStatus(false);
    setFilters((o) => {
      const notThisFilter = o.filter((prev) => prev.code_header !== code_header);
      const ret = [...notThisFilter, ...filters];
      return ret;
    });
  };

  /**
   *
   * @param event the button click event
   * @param reset force calling the parent handler with empty array
   */
  const handleApplyFilters = (event: React.MouseEvent<HTMLInputElement>, reset = false): void => {
    props.onApplyFilters({ start, end }, reset ? [] : filters);
  };

  /**
    1) resets the filters state
    2) triggers selects to unselect all menu items
    3) updates apply button enabled status
   */
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

  const handleChangeLatestPings = (v: Record<string, boolean>): void => {
    const val = v['Show Latest Pings'];
    if (isLatestPing != val) {
      setIsLatestPing(val);
      props.onShowLatestPings(val);
    }
  };

  const handleDrawerOpen = (): void => setOpen((o) => !o);
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
          <IconButton onClick={handleDrawerOpen}>{open ? <Close /> : <FilterList htmlColor={'#ffffff'} />}</IconButton>
        </div>
        {open ? (
          <>
            <div className={'side-panel-title'}>
              <h3>Filters</h3>
            </div>
            <div className='side-panel-body'>
              <div>
                <Checkbox
                  label='Show Latest Pings'
                  initialValue={isLatestPing}
                  changeHandler={handleChangeLatestPings}
                />
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
              {createMultiSelects()}
              <div className={'side-btns'}>
                <Button disabled={applyButtonDisabledStatus} onClick={handleApplyFilters}>
                  Apply
                </Button>
                <Button disabled={numFiltersSelected === 0} onClick={resetFilters}>
                  Reset
                </Button>
              </div>
              <p>{numFiltersSelected} filters selected</p>
            </div>
          </>
        ) : (
          <></>
        )}
      </Drawer>
    </div>
  );
}
