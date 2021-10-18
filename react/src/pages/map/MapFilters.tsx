import { Box, Button, Divider, Grid, IconButton } from '@mui/material';
import AutoComplete from 'components/form/Autocomplete';
import clsx from 'clsx';
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
import { columnToHeader } from 'utils/common_helpers';
import MultiSelect, { ISelectMultipleData } from 'components/form/MultiSelect';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { CODE_FILTERS, DEVICE_STATUS_OPTIONS } from 'pages/map/map_constants';
import { Tooltip } from 'components/common';
import DateInput from 'components/form/Date';
import dayjs from 'dayjs';

type MapFiltersProps = {
  start: string;
  end: string;
  uniqueDevices: number[];
  unassignedDevices: number[];
  onCollapsePanel: () => void;
  onApplyFilters: (r: MapRange, filters: ICodeFilter[]) => void;
  onClickEditUdf: () => void;
  onShowLatestPings: (b: boolean) => void;
  onShowLastFixes: (b: boolean) => void;
  onShowUnassignedDevices: (o: ISelectMultipleData[]) => void;
};

export default function MapFilters(props: MapFiltersProps): JSX.Element {
  const { uniqueDevices, unassignedDevices } = props;
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
          <SelectCode
            propName={cf.header}
            fullWidth
            multiple
            label={cf.label ?? columnToHeader(cf.header)}
            codeHeader={cf.header}
            changeHandler={null}
            changeHandlerMultiple={(codes): void => changeFilter(codes, cf.header)}
            triggerReset={reset}
            addEmptyOption={true}
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

  const handleChangeDeviceList = (values: ISelectMultipleData[]): void => {
    const asFilters: ICodeFilter[] = values.map((v) => {
      return { code_header: 'device_id', description: v.value as number, code: '', code_header_title: '', id: 0 };
    });
    changeFilter(asFilters, 'device_id');
  };

  const handleDrawerOpen = (): void => {
    const newVal = !open;
    setOpen(newVal);
    if (open) {
      // notify map parent that it needs to resize
      props.onCollapsePanel();
    }
  };

  const createDeviceList = (): ISelectMultipleData[] => {
    const merged = [...uniqueDevices, ...unassignedDevices].sort((a, b) => a - b);
    return merged.map((d) => {
      const displayLabel = unassignedDevices.includes(d) ? `${d} (unassigned)` : d.toString();
      return { id: d, value: d, displayLabel };
    });
  };

  return (
    <Box
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}>
      <Box className="side-panel-content">
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3}>
          <h2>Filters</h2>
          <Box className="drawer-toggle-button">
            <IconButton color="primary" onClick={handleDrawerOpen} size="large">
              <Icon icon={open ? 'close' : 'forward'} />
            </IconButton>
          </Box>
        </Box>
        {open ? (
          <>
            <Box p={3} pt={0}>

              {/* render the date pickers */}
              <Box mb={2}>
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

              {/* render the unassigned/assigned data points selector */}
              <Box mb={2}>
                <Grid container spacing={2}>
                  <Grid item sm={12}>
                    <Tooltip
                      title={
                        <>
                          <p><b><em>{MapStrings.assignmentStatusOptionA}</em></b>{MapStrings.assignmentStatusTooltip1}</p>
                          <p><b><em>{MapStrings.assignmentStatusOptionU}</em></b>{MapStrings.assignmentStatusTooltip2}</p>
                          <p>{MapStrings.assignmentStatusTooltip3}</p>
                        </>
                      } >
                      <div>
                        <MultiSelect
                          label={MapStrings.assignmentStatusLabel}
                          data={DEVICE_STATUS_OPTIONS}
                          changeHandler={props.onShowUnassignedDevices}
                        />
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>

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
              <Box mb={2}>
                <Grid container spacing={2}>
                  <Grid item sm={12}>
                    <Tooltip title={<p>{MapStrings.deviceListTooltip}</p>}>
                      <AutoComplete
                        label={MapStrings.deviceListLabel}
                        data={createDeviceList()}
                        changeHandler={handleChangeDeviceList}
                        triggerReset={reset}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>

              {/* render the other select filter components */}
              <Box mb={2}>
                <Grid container spacing={2}>
                  {createMultiSelects()}
                </Grid>
              </Box>

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
                          triggerReset={reset}
                          udfType={eUDFType.critter_group}
                          label={MapStrings.customAnimalGroupLabel}
                          changeHandler={handleChangeUDF}
                        />
                        <IconButton onClick={props.onClickEditUdf} size="large">
                          <Icon icon='edit' />
                        </IconButton>
                      </div>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box className={'form-buttons'} display="flex" justifyContent="flex-end" py={3}>
                <Button color='primary' variant='contained' disabled={applyButtonStatus} onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button color="primary" variant='outlined' disabled={numFiltersSelected === 0} onClick={resetFilters}>
                  Reset
                </Button>
              </Box>

            </Box>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
}