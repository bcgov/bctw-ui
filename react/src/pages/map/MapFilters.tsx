import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Slide,
  Tab,
  TableHead,
  TableCell,
  TableRow,
  Tabs,
  Typography,
  TableContainer,
  TableBody,
  Table,
  Paper
} from '@mui/material';
import AutoComplete from 'components/form/Autocomplete';
import clsx from 'clsx';
import React, { ReactNode, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import { getEvenlySpacedColour, getUniquePropFromPings } from './map_helpers';
import BasicTable from 'components/table/BasicTable';
enum TabNames {
  search = 'Search',
  filter = 'Filter',
  symbolize = 'Symbolize'
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
  const DEFAULT_SYMBOLIZE = 'device_id';
  const { search, filter, symbolize } = TabNames;
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
  // controls symbolize value
  const [symbolizeBy, setSymbolizeBy] = useState(DEFAULT_SYMBOLIZE);

  const createUniqueList = (propName: keyof TelemetryDetail): ISelectMultipleData[] => {
    const devices = getUniquePropFromPings(pings ?? [], propName) as number[];
    const merged = [...devices].sort((a, b) => a - b);
    return merged.map((d) => {
      // const displayLabel = unassignedDevices.includes(d) ? `${d} (unassigned)` : d.toString();
      const displayLabel = d.toString();
      return { id: d, value: d, displayLabel, prop: propName };
    });
  };

  const getFormValues = () =>
    CODE_FILTERS.map((cf, idx) => {
      const list = createUniqueList(cf.header);
      return {
        id: idx,
        header: cf.header,
        label: columnToHeader(cf?.label ?? cf.header),
        values: list.map((val, i) => ({
          item: val,
          colour: getEvenlySpacedColour(list.length, i)
        }))
      };
    });

  // controls the formValues, used in filters / symbolize pages
  const [formValues, setFormValues] = useState(getFormValues());

  useEffect(() => {
    console.log({ filters });
  }, [filters]);

  const orLabelStyle = {
    color: '#6d6d6d',
    display: 'flex',
    fontSize: '13px',
    justifyContent: 'center'
  };

  // Update the formfield values when pings are loaded.
  // Use memo to minimize computing result.
  useMemo(() => {
    if (pings?.length) {
      setFormValues(getFormValues());
    }
  }, [pings]);

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

  const handleApplySymbolize = (): void => {};
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

  const resetSymbolize = (): void => {
    setSymbolizeBy(DEFAULT_SYMBOLIZE);
  };
  // udfs are treated as any other filter, use this function to convert them
  // and then 'push' them to the normal filter change handler
  const handleChangeUDF = (v: IUDF[]): void => {
    const asNormalFilters = transformUdfToCodeFilter(v, eUDFType.critter_group);
    changeFilter(asNormalFilters, 'critter_id');
  };

  // only code_header and description are actually used when applying the filter
  const handleChangeAutocomplete = (values: ISelectMultipleData[], header: string): void => {
    if (!values.length) {
      changeFilter([], header);
      return;
    }

    const header_id = values[0].prop;
    const asFilters: ICodeFilter[] = values.map((v) => {
      return { code_header: v.prop, description: v.value, code: '', code_header_title: '', id: 0 };
    });
    console.log({ asFilters });
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

  const handleTabChange = (event: SyntheticEvent<Element>, newValue: TabNames): void => {
    setTab(newValue);
  };

  const isTab = (tabName: TabNames): boolean => tabName === tab;
  // creates select elements
  const createFilters = (): React.ReactNode => {
    const itemSpacing = isTab(filter) ? 12 : false;
    const boxContainerSpacing = isTab(filter) ? 2 : 0;
    return (
      <>
        {isTab(filter) && (
          <Box mb={boxContainerSpacing}>
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
        )}

        <Box mb={boxContainerSpacing}>
          <Grid container spacing={boxContainerSpacing}>
            {formValues.map((fv, idx) => (
              <Grid item sm={itemSpacing} key={`${fv.header}-${fv.id}`}>
                <Tooltip title={<p>{MapStrings.codeFiltersTooltips[fv.header]}</p>}>
                  <AutoComplete
                    label={fv.label}
                    data={fv.values.map((v) => v.item)}
                    changeHandler={handleChangeAutocomplete}
                    triggerReset={reset}
                    isMultiSearch
                    hidden={!isTab(filter)}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* //Fix me this will need to be changed to how autocomplete section works. */}
        {isTab(filter) && (
          <Box mb={boxContainerSpacing}>
            <div style={orLabelStyle}>&mdash; or &mdash;</div>
          </Box>
        )}
        <Box mb={boxContainerSpacing}>
          <Grid container spacing={boxContainerSpacing}>
            <Grid item sm={itemSpacing}>
              <Tooltip title={<p>{MapStrings.customAnimalGroupTooltip}</p>}>
                <div className={'side-panel-udf'}>
                  <SelectUDF
                    className={'udf-select-control'}
                    triggerReset={reset}
                    udfType={eUDFType.critter_group}
                    label={MapStrings.customAnimalGroupLabel}
                    changeHandler={handleChangeUDF}
                    hidden={!isTab(filter)}
                  />
                  {isTab(filter) && (
                    <IconButton onClick={props.onClickEditUdf}>
                      <Icon icon='edit' />
                    </IconButton>
                  )}
                </div>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
      </>
    );
  };

  const createSearch = (): ReactNode => {
    return (
      <>
        {isTab(search) && (
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
          </Box>
        )}
      </>
    );
  };

  const createSymbolize = (): ReactNode => {
    const handleSymbolizeBy = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSymbolizeBy((e.target as HTMLInputElement).value);
    };
    return (
      <>
        {isTab(symbolize) && (
          <Box mb={2} mt={2}>
            <Grid container spacing={2}>
              <Grid item sm={6}>
                <FormControl>
                  <FormLabel>Categorize points by colour</FormLabel>
                  <RadioGroup value={symbolizeBy} onChange={handleSymbolizeBy} row>
                    {formValues.map((fv, idx) => (
                      <FormControlLabel
                        value={fv.header}
                        control={<Radio />}
                        label={fv.label}
                        key={`symbolize-${idx}`}
                        disabled={!fv.values?.length}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </>
    );
  };

  const createSymbolizeLegend = (): ReactNode => {
    const tableData = createUniqueList(symbolizeBy as keyof TelemetryDetail);
    const symbolizeData = formValues.find((el) => el.header == symbolizeBy).values;
    return (
      <>
        {isTab(symbolize) && (
          <>
            <h2>Legend</h2>
            <TableContainer component={Paper}>
              <Table aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>id</TableCell>
                    <TableCell>{columnToHeader(symbolizeBy)}</TableCell>
                    <TableCell>Colour</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {symbolizeData.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component='th' scope='row'>
                        {idx}
                      </TableCell>
                      <TableCell component='th' scope='row'>
                        {row.item.value}
                      </TableCell>
                      <TableCell>
                        <Box
                          className='colour-swatch'
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #999999',
                            backgroundColor: getEvenlySpacedColour(symbolizeData.length, idx)
                          }}></Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </>
    );
  };

  return (
    <Box
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      ref={containerRef}>
      <Box className='side-panel-content'>
        <Box
          display='flex'
          justifyContent={open ? 'start' : 'space-between'}
          alignItems='center'
          px={3}
          pl={1}
          flexDirection={open ? 'row-reverse' : 'row'}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab icon={<Icon icon={search as string} />} value={search} label={search} />
            <Tab icon={<Icon icon={filter as string} />} value={filter} label={filter} disabled={!pings?.length} />
            <Tab
              icon={<Icon icon={symbolize as string} />}
              value={symbolize}
              label={symbolize}
              disabled={!pings?.length}
            />
          </Tabs>
          {/* <h2>Filters</h2> */}
          <Box className='drawer-toggle-button'>
            <IconButton color='primary' onClick={handleDrawerOpen} size='large'>
              <Icon icon={open ? 'back' : 'forward'} />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        {/* {open ? (
          <> */}
        {/* <Slide direction="right" in={tab == TabNames.search || tab == TabNames.filter} container={containerRef.current}> */}
        <Box p={3} pt={0}>
          <h2>{tab}</h2>
          <Typography variant='subtitle2'>Lorem ipsum dolor sit amet</Typography>
          {createSearch()}
          {createFilters()}
          {createSymbolize()}
          {/* <Divider /> */}

          <Box className={'form-buttons'} display='flex' justifyContent='flex-start' py={2}>
            <Button
              color='primary'
              variant='contained'
              disabled={!isTab(symbolize) && applyButtonStatus}
              onClick={isTab(symbolize) ? handleApplySymbolize : handleApplyFilters}>
              {tab}
            </Button>

            {isTab(filter) && (
              <Button color='primary' variant='outlined' disabled={!numFiltersSelected} onClick={resetFilters}>
                Reset
              </Button>
            )}
          </Box>
          <Divider />
          {createSymbolizeLegend()}
        </Box>
        {/* </Slide> */}
        {/* </>
        ) : (
          <></>
        )} */}
      </Box>
    </Box>
  );
}
