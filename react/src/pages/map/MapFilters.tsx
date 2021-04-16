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
import SelectUDF from 'components/form/SelectUDF';
import { eUDFType, IUDF, transformUdfToCodeFilter } from 'types/udf';
import { Icon } from 'components/common';
import { MapStrings } from 'constants/strings';
import { columnToHeader } from 'utils/common';
import MultiSelect, { ISelectMultipleData } from 'components/form/MultiSelect';
import useDidMountEffect from 'hooks/useDidMountEffect';

type MapFiltersProps = PageProp & {
  start: string;
  end: string;
  uniqueDevices: number[];
  onApplyFilters: (r: MapRange, filters: ICodeFilter[]) => void;
  onApplySelectDevices: (device_ids: number[]) => void;
  onClickEditUdf: () => void;
  onShowLatestPings: (b: boolean) => void;
  onShowLastFixes: (b: boolean) => void;
  // todo: onShowUnassignedDevices: (b: boolean) => void;
};

export default function MapFilters(props: MapFiltersProps): JSX.Element {
  const classes = drawerStyles();
  // controls filter panel visibility
  const [open, setOpen] = useState<boolean>(true); 
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [numFiltersSelected, setNumFiltersSelected] = useState<number>(0);
  // state for start and end ranges (date pickers)
  const [start, setStart] = useState<string>(props.start);
  const [end, setEnd] = useState<string>(props.end);
  const [wasDatesChanged, setWasDatesChanged] = useState<boolean>(false);
  // reset filter button status
  const [reset, setReset] = useState<boolean>(false); 
  // controls apply button disabled status
  const [applyButtonStatus, setApplyButtonStatus] = useState<boolean>(true);
  const [isLatestPing, setIsLatestPing] = useState<boolean>(false);
  const [isLastFixes, setIsLastFixes] = useState<boolean>(false);

  // keep track of how many filters are currently set
  useEffect(() => {
    setNumFiltersSelected(filters.length);
  }, [filters]);

  // handler for when a date is changed
  useEffect(() => {
    const onChangeDate = (): void => {
      if (end !== props.end || start !== props.start) {
        setApplyButtonStatus(false);
        setWasDatesChanged(true);
      }
    };
    onChangeDate();
  }, [start, end]);

  // call parent handler when latest ping changes
  useDidMountEffect(() => {
    props.onShowLatestPings(isLatestPing);
  }, [isLatestPing])

  useDidMountEffect(() => {
    props.onShowLastFixes(isLastFixes);
  }, [isLastFixes])

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
    1) uses a timeout to temporarily set reset status to true,
      the select components are listening for these changes, which 
      trigger them to unselect all menu items
    2) also resets the apply button enabled state
  */
  const resetFilters = (): void => {
    setApplyButtonStatus(true);
    setReset(true);
    setTimeout(() => setReset(false), 1000);

    setFilters([]);
    // since setFilters is async, call handleApplyFilters manually with an empty array
    handleApplyFilters(null, true);
  };

  const codeFilters: { header: string, label?: string }[] = [
    { header: 'species' },
    { header: 'animal_status' },
    { header: 'device_status' },
    { header: 'sex' },
  ];

  // creates select elements
  const createMultiSelects = (): React.ReactNode => {
    return codeFilters.map((cf, idx) => (
      <div key={`${cf.header}-${idx}`}>
        <SelectCode
          multiple
          label={cf.label ?? columnToHeader(cf.header)}
          codeHeader={cf.header}
          changeHandler={null}
          changeHandlerMultiple={(codes): void => changeFilter(codes, cf.header)}
          triggerReset={reset}
          addEmptyOption={true}
        />
      </div>
    ));
  };

  // udfs are treated as any other filter, use this function to convert them
  // and then 'push' them to the normal filter change handler
  const handleChangeUDF = (v: IUDF[]): void => {
    const asNormalFilters = transformUdfToCodeFilter(v, eUDFType.critter_group);
    changeFilter(asNormalFilters, 'critter_id');
  };

  const handleChangeDeviceList = (values: ISelectMultipleData[]): void => {
    const asFilters: ICodeFilter[] = values.map(v => {
      return {code_header: 'device_id', description: v.value as number, code: '', code_header_title: '', id: 0}
    }) 
    changeFilter(asFilters, 'device_id');
  }

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
                {/* render the date pickers */}
                <TextField
                  outline={true}
                  label={MapStrings.filterRangeStart}
                  type='date'
                  defaultValue={start}
                  propName='tstart'
                  changeHandler={(e): void => setStart(e['tstart'] as string)}
                />
                <TextField
                  outline={true}
                  label={MapStrings.filterRangeEnd}
                  type='date'
                  defaultValue={end}
                  propName='tend'
                  changeHandler={(e): void => setEnd(e['tend'] as string)}
                />
              </div>
              <div>
                {/* render the last pings/ last 10 fixes checkboxes */}
                <Checkbox
                  label={MapStrings.lastPingLabel}
                  initialValue={isLatestPing}
                  changeHandler={(): void => setIsLatestPing(o => !o)}
                />
                <Checkbox
                  label={MapStrings.lastFixesLabel}
                  initialValue={isLastFixes}
                  changeHandler={(): void => setIsLastFixes(o => !o)}
                />
              </div>
              <div>
                {/* render the device list selector */}
                <MultiSelect
                  renderTypeLabel='devices'
                  label={'Device List'}
                  data={props.uniqueDevices.map(d => {return {id: d, value: d}})}
                  changeHandler={handleChangeDeviceList}
                  triggerReset={reset}
                />
              </div>
              {/* render the other select filter components */}
              {createMultiSelects()}
              {/* render the custom animal set component */}
              <div className={'side-panel-udf'}>
                <SelectUDF
                  triggerReset={reset}
                  udfType={eUDFType.critter_group}
                  label={MapStrings.filterUserCritterGroup}
                  changeHandler={handleChangeUDF}
                />
                <IconButton onClick={props.onClickEditUdf}>
                  <Icon icon='edit' />
                </IconButton>
              </div>
              <hr />
              <div className={'side-btns'}>
                <Button color='primary' variant='contained' disabled={applyButtonStatus} onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant='outlined' disabled={numFiltersSelected === 0} onClick={resetFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </Drawer>
    </div>
  );
}
