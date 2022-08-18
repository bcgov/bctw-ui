import { Box, Button, Divider, Grid, IconButton, Slide, Tab, Tabs } from '@mui/material';
import AutoComplete from 'components/form/Autocomplete';
import clsx from 'clsx';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import SelectCode from 'components/form/SelectCode';
import { ICodeFilter } from 'types/code';
import { MapRange, TelemetryDetail } from 'types/map';
import drawerStyles from 'components/sidebar/drawer_classes';
import Checkbox from 'components/form/Checkbox';
import SelectUDF from 'components/form/SelectUDF';
import { eUDFType, IUDF, transformUdfToCodeFilter } from 'types/udf';
import { Icon } from 'components/common';
import { MapStrings } from 'constants/strings';
import { columnToHeader } from 'utils/common_helpers';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { CODE_FILTERS } from 'pages/map/map_constants';
import { Tooltip } from 'components/common';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { ITelemetryPoint } from 'types/map';
import { getUniquePropFromPings } from './map_helpers';
enum TabNames {
  search = "Search",
  filter = "Filter",
  symbolize = "Symbolize",
}
type MapFiltersProps = {
  start: string;
  end: string;
  // uniqueDevices: number[];
  // collectiveUnits: string[];
  // pingsToDisplay: boolean;
  pings: ITelemetryPoint[];
  onCollapsePanel: () => void;
  onApplyFilters: (r: MapRange, filters: ICodeFilter[]) => void;
  onClickEditUdf: () => void;
  onShowLatestPings: (b: boolean) => void;
  onShowLastFixes: (b: boolean) => void;
  // onShowUnassignedDevices: (o: ISelectMultipleData[]) => void;
};

export default function MapFilters(props: MapFiltersProps): JSX.Element {
  const { pings } = props;
  const {search, filter, symbolize} = TabNames;
  const classes = drawerStyles();
  const containerRef = useRef(null);
  // controls filter panel visibility
  const [open, setOpen] = useState(true);
  const [filters, setFilters] = useState<ICodeFilter[]>([]);
  const [numFiltersSelected, setNumFiltersSelected] = useState(0);
  // state for start and end ranges (date pickers)
  const [start, setStart] = useState(props.start);
  const [end, setEnd] = useState(props.end);
  const [wasDatesChanged, setWasDatesChanged] = useState(false);
  // reset filter button status
  const [reset, setReset] = useState(false);
  // controls apply button disabled status
  const [applyButtonStatus, setApplyButtonStatus] = useState(true);
  const [isLatestPing, setIsLatestPing] = useState(false);
  const [isLastFixes, setIsLastFixes] = useState(false);

  // controls the Tabs
  const [tab, setTab] = useState<TabNames>(TabNames.search);
  useEffect(()=> {console.log({filters})}, [filters])
  const orLabelStyle = {
    color: '#6d6d6d',
    display: 'flex',
    fontSize: '13px',
    justifyContent: 'center'
  }

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
  }, [isLatestPing]);

  useDidMountEffect(() => {
    props.onShowLastFixes(isLastFixes);
  }, [isLastFixes]);

  /**
   * handler for when a select component is changed
   * @param filters array passed from multi-select component
   * @param code_header the code header
   */
  const changeFilter = (filters: ICodeFilter[], code_header: string): void => {
    setApplyButtonStatus(false);
    setFilters((o) => {
      const notThisFilter = o.filter((prev) => prev.code_header !== code_header);
      console.log(notThisFilter);
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

  // creates select elements
  const createMultiSelects = (): React.ReactNode => {
    return CODE_FILTERS.map((cf, idx) => (
      <Grid item sm={12} key={`${cf.header}-${idx}`}>
        <Tooltip title={<p>{MapStrings.codeFiltersTooltips[cf.header]}</p>}>
          {/* <SelectCode
            propName={cf.header}
            style={{width: '100%'}}
            multiple
            label={cf.label ?? columnToHeader(cf.header)}
            codeHeader={cf.header}
            changeHandler={null}
            changeHandlerMultiple={(codes): void => changeFilter(codes, cf.header)}
            triggerReset={reset}
            addEmptyOption={true}
          /> */}
          <AutoComplete
            label={cf.label ?? columnToHeader(cf.header)}
            data={createUniqueList(cf.header)}
            changeHandler={handleChangeAutocomplete}
            triggerReset={reset}
            isMultiSearch
            />
        </Tooltip>
      </Grid>
    ));
  };

  // udfs are treated as any other filter, use this function to convert them
  // and then 'push' them to the normal filter change handler
  const handleChangeUDF = (v: IUDF[]): void => {
    const asNormalFilters = transformUdfToCodeFilter(v, eUDFType.critter_group);
    changeFilter(asNormalFilters, 'critter_id');
  };

  // only code_header and description are actually used when applying the filter
  const handleChangeAutocomplete = (values: ISelectMultipleData[], header: string): void => {
    //console.log({values}, {header})

    if (!values.length) {
      return;
    }

    const header_id = values[0].prop;
    const asFilters: ICodeFilter[] = values.map((v) => {
      return { code_header: v.prop, description: v.value, code: '', code_header_title: '', id: 0 };
    });
    changeFilter(asFilters, header_id);
  };

  const handleDrawerOpen = (): void => {
    const newVal = !open;
    setOpen(newVal);
    if (open) {
      // notify map parent that it needs to resize
      props.onCollapsePanel();
    }
  };

  const createUniqueList = (propName: keyof TelemetryDetail): ISelectMultipleData[] => {
    const devices = getUniquePropFromPings(pings ?? [], propName) as number[];
    const merged = [...devices].sort((a, b) => a - b);
    return merged.map((d) => {
      // const displayLabel = unassignedDevices.includes(d) ? `${d} (unassigned)` : d.toString();
      const displayLabel = d.toString();
      return { id: d, value: d, displayLabel, prop: propName };
    });
  };

  const createCollectiveList = (): ISelectMultipleData[] => {
    const collectiveUnits = getUniquePropFromPings(pings, 'collective_unit') as string[];
    return collectiveUnits.map((c, idx) => {
      return { id: idx, value: c, displayLabel: c, prop: 'collective_unit'}
    })
  }

  const handleTabChange = (event: SyntheticEvent<Element>, newValue: TabNames): void => {
    setTab(newValue);
  }

  const isTab = (tabName: TabNames): boolean => tabName === tab;
  return (
    <Box
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      ref={containerRef}>
      
      <Box className="side-panel-content">

        <Box display="flex" justifyContent="space-between" alignItems="center" px={3}>
        <Tabs value={tab} onChange={handleTabChange}>
        <Tab icon={<Icon icon={search as string}/>} value={search} label={search} />
        <Tab icon={<Icon icon={filter as string}/>} value={filter} label={filter} disabled={!pings?.length}/>
        <Tab icon={<Icon icon={symbolize as string}/>} value={symbolize} label={symbolize} disabled={!pings?.length}/>
        </Tabs>
          {/* <h2>Filters</h2> */}
          <Box className="drawer-toggle-button">
            <IconButton color="primary" onClick={handleDrawerOpen} size="large">
              <Icon icon={open ? 'close' : 'forward'} />
            </IconButton>
          </Box>
        </Box>
        <Divider/>
        {open ? (
          <>
            {/* <Slide direction="right" in={tab == TabNames.search || tab == TabNames.filter} container={containerRef.current}> */}
            <Box p={3} pt={0}>

              {/* render the date pickers */}
              <h2>{tab}</h2>

              {/* SEARCH */}
              {isTab(search) && 
              <Box mb={2} mt={2}>
                <Grid container spacing={2}>
                  <Grid item sm={6}>
                    <Tooltip title={<p>{MapStrings.startDateTooltip}</p>}>
                      <DateInput
                        fullWidth
                        propName='tstart'
                        label={MapStrings.startDateLabel}
                        defaultValue={dayjs(start)}
                        changeHandler={(e): void => setStart(e['tstart'] as string)}
                        maxDate={dayjs(end)}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item sm={6}>
                    <Tooltip title={<p>{MapStrings.endDateTooltip}</p>}>
                      <DateInput
                        fullWidth
                        propName='tend'
                        label={MapStrings.endDateLabel}
                        defaultValue={dayjs(end)}
                        changeHandler={(e): void => setEnd(e['tend'] as string)}
                        minDate={dayjs(start)}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>}

              {/* FILTER */}
              {isTab(filter) && 
              <>
              {/* render the last pings/ last 10 fixes checkboxes */}
              <Box mb={2}>
                <Tooltip inline={true} title={<p>{MapStrings.lastKnownLocationTooltip}</p>}>
                  <Checkbox
                    label={MapStrings.lastKnownLocationLabel}
                    propName={MapStrings.lastKnownLocationLabel}
                    initialValue={isLatestPing}
                    changeHandler={(): void => setIsLatestPing((o) => !o)}
                    disabled={isLastFixes}
                  />
                </Tooltip>
                <Tooltip inline={true} title={<p>{MapStrings.lastFixesTooltip}</p>}>
                  <Checkbox
                    propName={MapStrings.lastFixesLabel}
                    label={MapStrings.lastFixesLabel}
                    initialValue={isLastFixes}
                    changeHandler={(): void => setIsLastFixes((o) => !o)}
                    disabled={isLatestPing}
                    />
                </Tooltip>
              </Box>


              {/* render the device list selector */}
              {/* <Box mb={2}>
                <Grid container spacing={2}>
                  <Grid item sm={12}>
                    <Tooltip title={<p>{MapStrings.deviceListTooltip}</p>}>
                      <AutoComplete
                        label={MapStrings.deviceListLabel}
                        data={createUniqueList('device_id')}
                        changeHandler={handleChangeAutocomplete}
                        triggerReset={reset}
                        />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box> */}

              {/* render the other select filter components */}
              <Box mb={2}>
                <Grid container spacing={2}>
                  {createMultiSelects()}
                </Grid>
              </Box>
              {/* <Box mb={2}>
                <Grid container spacing={2}>
                <Grid item sm={12}>
                <AutoComplete
                  label={'species'}
                  data={createUniqueList('species')}
                  changeHandler={handleChangeAutocomplete}
                  triggerReset={reset}
                  isMultiSearch
                  />
                </Grid>
                </Grid>
              </Box> */}

              {/* render the collective unit list selector */}
              {/* <Box mb={2}>
                <Grid container spacing={2}>
                  <Grid item sm={12}>
                    <Tooltip title={<p>{MapStrings.collectiveUnitTooltip}</p>}>
                      <AutoComplete
                        label={MapStrings.collectiveUnitLabel}
                        data={createCollectiveList()}
                        changeHandler={handleChangeAutocomplete}
                        triggerReset={reset}
                        />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box> */}

              <Box mb={2}>
                <div style={orLabelStyle}>
                  &mdash; or &mdash;
                </div>
              </Box>

              {/* render the custom animal set component */}
              <Box mb={2}>
                <Grid container spacing={2}>
                  <Grid item sm={12}>
                    <Tooltip
                      title={<p>{MapStrings.customAnimalGroupTooltip}</p>}>
                      <div className={'side-panel-udf'}>
                        <SelectUDF
                          className={'udf-select-control'}
                          triggerReset={reset}
                          udfType={eUDFType.critter_group}
                          label={MapStrings.customAnimalGroupLabel}
                          changeHandler={handleChangeUDF}
                          />
                        <IconButton onClick={props.onClickEditUdf}>
                          <Icon icon='edit' />
                        </IconButton>
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
              </>
            }

            {/* SYMBOLIZE */}
            {isTab(symbolize) && 
              <Box mb={2} mt={2}>
                <Grid container spacing={2}>
                  <Grid item sm={6}>
                    {/* <Tooltip title={<p>{MapStrings.startDateTooltip}</p>}>
                    </Tooltip> */}
                  </Grid>
                  <Grid item sm={6}>
                    {/* <Tooltip title={<p>{MapStrings.endDateTooltip}</p>}>
                    </Tooltip> */}
                  </Grid>
                </Grid>
              </Box>}

              <Divider />

              <Box className={'form-buttons'} display="flex" justifyContent="flex-start" py={3}>
                <Button color='primary' variant='contained' disabled={applyButtonStatus} onClick={handleApplyFilters}>
                  {tab}
                </Button>
                {isTab(filter) && <Button color="primary" variant='outlined' disabled={numFiltersSelected === 0} onClick={resetFilters}>
                  Reset
                </Button>}
              </Box>
              
              

            </Box>
            {/* </Slide> */}
          </>
        ) : (
          <></>
        )}
      </Box>
    </Box>
    );
}