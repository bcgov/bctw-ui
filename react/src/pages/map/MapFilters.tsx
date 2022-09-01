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
  Tab,
  TableHead,
  TableCell,
  TableRow,
  Tabs,
  Typography,
  TableContainer,
  TableBody,
  Table,
  Paper,
  List,
  ListItemText,
  ListItemButton,
  ListSubheader,
  ListItem,
  ButtonGroup
} from '@mui/material';
import AutoComplete from 'components/form/Autocomplete';
import clsx from 'clsx';
import React, { ReactNode, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { DEFAULT_MFV, MapFormValue, MapRange, TelemetryDetail } from 'types/map';
import drawerStyles from 'components/sidebar/drawer_classes';
import Checkbox from 'components/form/Checkbox';
import SelectUDF from 'components/form/SelectUDF';
import { eUDFType, IUDF, transformUdfToCodeFilter } from 'types/udf';
import { Icon } from 'components/common';
import { MapStrings } from 'constants/strings';
import { columnToHeader } from 'utils/common_helpers';
import { ISelectMultipleData } from 'components/form/MultiSelect';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { Tooltip } from 'components/common';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';
import { ITelemetryPoint } from 'types/map';
import { getFormValues } from './map_helpers';
import { MapWeekMonthPresets, SEARCH_PRESETS } from './map_constants';
import { getStartDate, StartDateKey } from 'utils/time';
import makeStyles from '@mui/styles/makeStyles';

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
  onApplySymbolize: (s: MapFormValue, includeLatest: boolean) => void;
  onClickEditUdf: () => void;
  onShowLatestPings: (b: boolean) => void;
  onShowLastFixes: (b: boolean) => void;
  // onShowUnassignedDevices: (o: ISelectMultipleData[]) => void;
};
const useMapStyles = makeStyles((theme) => ({
  presetBtn: {
    backgroundColor: theme.palette.info.main,
    minWidth: '8rem'
  },
  btn: {
    minWidth: '8rem',
    marginRight: '0.5rem'
  }
}));
export default function MapFilters(props: MapFiltersProps): JSX.Element {
  const { pings } = props;
  const { search, filter, symbolize } = TabNames;
  const classes = drawerStyles();
  const mapStyles = useMapStyles();
  // controls filter panel visibility
  const [open, setOpen] = useState(true);
  const [filters, setFilters] = useState<ICodeFilter[]>([]);

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

  // controls the formValues, used in filters / symbolize pages
  // Nothing actually calls on inital page load. Pings load after this fires.
  const [formValues, setFormValues] = useState<MapFormValue[]>([DEFAULT_MFV]);

  // controls symbolize value
  const [symbolizeBy, setSymbolizeBy] = useState(DEFAULT_MFV.header);
  const [symbolizeLast, setSymbolizeLast] = useState(true);

  const isTab = (tabName: TabNames): boolean => tabName === tab;

  const symbolizeOrFilterPanel = isTab(filter) || isTab(symbolize);

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
      setFormValues(getFormValues(pings));
    }
  }, [pings]);

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

  useDidMountEffect(() => {
    if (symbolizeBy === DEFAULT_MFV.header) {
      handleApplySymbolize();
    }
  }, [symbolizeBy]);

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
    setSymbolizeBy(DEFAULT_MFV.header);
    setSymbolizeLast(true);
  };

  const handleApplySymbolize = (): void => {
    const symbolize = formValues.find((fv) => fv.header === symbolizeBy);
    props.onApplySymbolize(symbolize, symbolizeLast);
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

  const handlePresets = (key: StartDateKey): void => {
    setStart(getStartDate(end, key));
    // handleApplyFilters(null);
  };

  const createSearch = (): ReactNode => {
    const SearchPresetButtons = (presets: MapWeekMonthPresets[]): JSX.Element => {
      return <></>;
    };
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
                <ListSubheader sx={{ pl: 0, pt: 0, pb: 0 }}>Month Presets</ListSubheader>
                <List sx={{ pt: 0 }}>
                  {SEARCH_PRESETS.months.map((sp) => (
                    <ListItem sx={{ pl: 0, pt: 0 }}>
                      <Button
                        className={mapStyles.presetBtn}
                        variant='contained'
                        size='medium'
                        key={sp.key}
                        onClick={() => handlePresets(sp.key)}>
                        {sp.label}
                      </Button>
                    </ListItem>
                  ))}
                </List>
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
                <ListSubheader sx={{ pl: 0, pt: 0, pb: 0 }}>Week Presets</ListSubheader>
                <List sx={{ pt: 0 }}>
                  {SEARCH_PRESETS.weeks.map((sp) => (
                    <ListItem sx={{ pl: 0, pt: 0 }}>
                      <Button
                        className={mapStyles.presetBtn}
                        variant='contained'
                        color='primary'
                        size='medium'
                        key={sp.key}
                        onClick={() => handlePresets(sp.key)}>
                        {sp.label}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        )}
      </>
    );
  };

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
              <Grid item sm={itemSpacing} key={`${fv.header}-${idx}`}>
                <Tooltip title={<p>{MapStrings.codeFiltersTooltips[fv.header]}</p>}>
                  <AutoComplete
                    label={fv.header === DEFAULT_MFV.header ? 'Device ID' : fv.label}
                    data={fv.values}
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

  const createSymbolize = (): ReactNode => {
    const handleSymbolizeBy = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setSymbolizeBy((e.target as HTMLInputElement).value as keyof TelemetryDetail);
    };
    const boxContainerSpacing = isTab(symbolize) ? 2 : 0;
    return (
      <>
        {isTab(symbolize) && (
          <>
            <Box mb={boxContainerSpacing}>
              <Tooltip inline={true} title={<p>{MapStrings.lastKnownLocationTooltip}</p>}>
                <Checkbox
                  label='Symbolize last known location'
                  propName={MapStrings.lastKnownLocationLabel}
                  initialValue={symbolizeLast}
                  changeHandler={(): void => setSymbolizeLast((o) => !o)}
                  disabled={isLastFixes}
                />
              </Tooltip>
            </Box>
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
          </>
        )}
      </>
    );
  };
  const createSymbolizeLegend = (): ReactNode => {
    const symbolizeData = formValues.find((el) => el.header == symbolizeBy).values;
    return (
      <>
        {isTab(symbolize) && (
          <>
            <h2>Legend</h2>
            <TableContainer component={Paper} sx={{ border: 1 }}>
              <Table aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Colour</TableCell>
                    <TableCell>{columnToHeader(symbolizeBy)}</TableCell>
                    <TableCell>Point Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {symbolizeData.map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box
                          className='colour-swatch'
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '1px solid #999999',
                            backgroundColor: row.colour
                          }}></Box>
                      </TableCell>
                      <TableCell component='th' scope='row'>
                        {row.displayLabel}
                      </TableCell>
                      <TableCell component='th' scope='row'>
                        {row.pointCount}
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
      })}>
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
          <Box className='drawer-toggle-button'>
            <IconButton color='primary' onClick={handleDrawerOpen} size='large'>
              <Icon icon={open ? 'back' : 'forward'} />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        <Box p={3} pt={0} style={open ? {} : { marginRight: '2rem' }}>
          <h2>{tab}</h2>
          <Typography variant='subtitle2'>{MapStrings.mapPanels.subTitle[tab]}</Typography>
          {createSearch()}
          {createFilters()}
          {createSymbolize()}
          <Box display='flex' justifyContent='flex-start' py={2}>
            <Button
              color='primary'
              variant='contained'
              className={mapStyles.btn}
              disabled={!isTab(symbolize) && applyButtonStatus}
              onClick={isTab(symbolize) ? handleApplySymbolize : handleApplyFilters}>
              {tab}
            </Button>
            {symbolizeOrFilterPanel && (
              <Button
                color='primary'
                variant='outlined'
                className={mapStyles.btn}
                disabled={isTab(symbolize) ? symbolizeBy === DEFAULT_MFV.header : applyButtonStatus}
                onClick={isTab(symbolize) ? (): void => setSymbolizeBy(DEFAULT_MFV.header) : resetFilters}>
                Reset
              </Button>
            )}
          </Box>
          <Divider />
          {createSymbolizeLegend()}
        </Box>
      </Box>
    </Box>
  );
}
