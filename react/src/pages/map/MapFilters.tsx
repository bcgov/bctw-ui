import { Button, Drawer, IconButton } from '@material-ui/core';
import { FilterList, Close } from '@material-ui/icons';
import { PageProp } from 'components/component_interfaces';
import clsx from 'clsx';
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
  const classes = drawerStyles();
  const [open, setOpen] = useState<boolean>(true); // controls filter panel visibility
  const [filters, setFilters] = useState<ICodeFilter[]>([]); // the filters applied
  const [numFiltersSelected, setNumFiltersSelected] = useState<number>(0); // how many filters are set (dev?)
  const [start, setStart] = useState<string>(props.start); // time range start
  const [end, setEnd] = useState<string>(props.end); // time range end
  const [reset, setReset] = useState<boolean>(false); // reset filter button status
  const [applyButtonStatus, setApplyButtonStatus] = useState<boolean>(true); // controls apply button disabled status
  const [isLatestPing, setIsLatestPing] = useState<boolean>(false);
  const [wasDatesChanged, setWasDatesChanged] = useState<boolean>(false);

  useEffect(() => {
    setNumFiltersSelected(filters.length);
  }, [filters]);

  useEffect(() => {
    const onChangeDate = (): void => {
      if (end !== props.end || start !== props.start) {
        setApplyButtonStatus(false);
        setWasDatesChanged(true);
      }
    };
    onChangeDate();
  }, [start, end]);

  /**
   * handler for when a select component is changed
   * @param filters array passed from multi-select component
   * @param code_header the code header
   */
  const changeFilter = (filters: ICodeFilter[], code_header: string): void => {
    setApplyButtonStatus(false);
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
    // if dates were changed, it will draw all the new points, so 
    // set the status of the show latest pings checkbox to false
    if (wasDatesChanged) {
      setIsLatestPing(false);
    }
  };

  /**
    1) resets the filters state
    2) triggers selects to unselect all menu items
    3) updates apply button enabled status
   */
  const resetFilters = (): void => {
    setApplyButtonStatus(true);
    // fixme: ugly
    setReset(true);
    setTimeout(() => setReset(false), 1000);

    setFilters([]);
    // since setFilters is async,
    // call handleApplyFilters with an empty filter array
    handleApplyFilters(null, true);
  };

  const codeFilters = [
    { header: 'population_unit', label: 'Population' },
    { header: 'species', label: 'Species' },
    { header: 'sex', label: 'Gender' }
  ];
  const latestPingLabel = 'Only show last location';

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
    const val = v[latestPingLabel];
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
        <div className={open ? 'side-panel-toolbar' : 'side-panel-toolbar-closed'}>
          {open ? <h3>Filters</h3> : null}
          <IconButton onClick={handleDrawerOpen}>{open ? <Close /> : <FilterList htmlColor={'#ffffff'} />}</IconButton>
        </div>
        {open ? (
          <>
            <div className='side-panel-body'>
              <div className={'side-panel-dates'}>
                <TextField
                  outline={true}
                  label='Start Date'
                  type='date'
                  defaultValue={start}
                  propName='tstart'
                  changeHandler={(e): void => setStart(e['tstart'] as string)}
                />
                <TextField
                  outline={true}
                  label='End Date'
                  type='date'
                  defaultValue={end}
                  propName='tend'
                  changeHandler={(e): void => setEnd(e['tend'] as string)}
                />
              </div>
              <div><Checkbox label={latestPingLabel} initialValue={isLatestPing} changeHandler={handleChangeLatestPings}/></div>
              {createMultiSelects()}
              <hr/>
              <div className={'side-btns'}>
                <Button color='primary' variant='contained' disabled={applyButtonStatus} onClick={handleApplyFilters}>Apply Filters</Button>
                <Button variant='outlined' disabled={numFiltersSelected === 0} onClick={resetFilters}>Clear</Button>
              </div>
              {/* <p>{numFiltersSelected} filters selected</p> */}
            </div>
          </>
        ) : (
          <></>
        )}
      </Drawer>
    </div>
  );
}
