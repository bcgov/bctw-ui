import { Box } from '@mui/material';
import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import {
  DetailsSortOption,
  ITelemetryPoint,
  ITelemetryGroup,
  OnPanelRowSelect,
  OnMapRowCellClick,
  OnlySelectedCritters,
  MapRange
} from 'types/map';
import Checkbox from 'components/form/Checkbox';
import { getPointIDsFromTelemetryGroup, getUniqueCritterIDsFromSelectedPings, groupPings } from '../map_helpers';
import MapExport from 'pages/map/MapExport';
import { Button } from '@mui/material';
import { MapStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { Tooltip } from 'components/common';
import { useMapState } from '../MapMarkerContext';

export type MapDetailsBaseProps = {
  handleRowSelected: OnPanelRowSelect;
  handleShowOverview: OnMapRowCellClick;
  handleRowHovered: any;
};

export type MapDetailsProps = MapDetailsBaseProps & {
  pings: ITelemetryPoint[];
  unassignedPings: ITelemetryPoint[];
  // telemetry IDs of points that have a device/animal attached
  selectedAssignedIDs: number[];
  showExportModal: boolean;
  setShowExportModal: (b: boolean) => void;
  // handler for when 'show only checked' is clicked.
  handleShowOnlySelected: (o: OnlySelectedCritters) => void;
  timeRange: MapRange;
};

/**
 * the bottom details panel (aka attribute table) of the 2D map
 * note: fixme: unassigned points not handled correctly for all features!
 */
export default function MapDetails({
  pings,
  unassignedPings,
  selectedAssignedIDs,
  handleShowOverview,
  handleShowOnlySelected,
  handleRowSelected,
  handleRowHovered,
  showExportModal,
  setShowExportModal,
  timeRange
}: MapDetailsProps): JSX.Element {
  // ping state from the map. Applying filters will update this state
  const [groupedPings, setGroupedPings] = useState<ITelemetryGroup[]>([]);
  const [groupedUnassignedPings, setGroupedUnassignedPings] = useState<ITelemetryGroup[]>([]);

  const [crittersSelectedInMap, setCrittersSelectedInMap] = useState<string[]>([]);

  // state for the 'checked' rows in the table
  const [pingGroupChecked, setPingGroupChecked] = useState<ITelemetryGroup[]>([]);

  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [sort] = useState<DetailsSortOption>('wlh_id');

  const [{ selectedCritters, selectedMarkers }, dispatch] = useMapState();


  // upon initial load, display all critters in bottom panel
  useEffect(() => {
    const byCritter = groupPings(pings, sort);
    const byDevice = groupPings(unassignedPings, sort, 'collar_id').filter((g) => !g.critter_id);
    setGroupedPings(byCritter);
    setGroupedUnassignedPings(byDevice);
  }, [pings]);

  // when user limits features selection via the map highlight them in child details component
  useEffect(() => {
    const update = (): void => {
      const critterIds = getUniqueCritterIDsFromSelectedPings(pings, selectedAssignedIDs);
      setCrittersSelectedInMap(critterIds);
    };
    update();
  }, [selectedAssignedIDs]);

  // when the 'show only selected' checkbox is changed, update parent map state
  useDidMountEffect(() => {
    if (pings) {
      handleRowsChecked(getPointIDsFromTelemetryGroup(pingGroupChecked));
    }
  }, [showOnlySelected]);

  useEffect(() => {
    setPingGroupChecked(groupPings([...pings, ...unassignedPings].filter((f) => selectedMarkers.includes(f.id))))
  }, [selectedMarkers])

  // upon rows checked in each row, note: unassigned IDs are negative integers
  const handleRowsChecked = (ids: number[]): void => {
    const grouped = groupPings([...pings, ...unassignedPings].filter((f) => ids.includes(f.id)));
    setPingGroupChecked(grouped);
    handleRowSelected(ids);
    if (showOnlySelected) {
      // fixme: unassigned not handled!
      handleShowOnlySelected({ show: true, critter_ids: grouped.map((g) => g.critter_id) });
    }
  };

  const handleShowSelectedChecked = (val: Record<string, boolean>): void => {
    console.log(val)
    const isChecked = val[MapStrings.showOnlyCheckedLabel];
    setShowOnlySelected(isChecked);
    // call the parent handler
    handleShowOnlySelected({ show: isChecked, critter_ids: pingGroupChecked.map((g) => g.critter_id) });
  };

  if (!groupedPings.length && !groupedUnassignedPings.length) {
    return (
      <Box color='orangered' className={'map-detail-container'} display='flex' alignItems={'center'} justifyContent={'center'}>
        <p style={{fontSize: '18px', fontWeight: 'bolder'}}>{MapStrings.noCrittersFound}</p>
      </Box>
    );
  }

  return (
    <Box className={'map-detail-container'} display='flex' flexDirection='column'>
      <Box className={'map-detail-titlebar'} display='flex' justifyContent='flex-end' p={2}>
        <Tooltip inline={true} placement='left-start' title={<p>{MapStrings.showOnlyCheckedTooltip}</p>}>
          <Checkbox
            propName={MapStrings.showOnlyCheckedLabel}
            label={MapStrings.showOnlyCheckedLabel}
            initialValue={false}
            changeHandler={handleShowSelectedChecked}
          />
        </Tooltip>
        <Button onClick={(): void => setShowExportModal(true)} variant='outlined'>
          Export
        </Button>
      </Box>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        pings={[...groupedPings, ...groupedUnassignedPings]}
        handleShowOverview={handleShowOverview}
        handleRowSelected={handleRowsChecked}
        handleRowHovered={handleRowHovered}
      />
      <MapExport
        groupedAssignedPings={pingGroupChecked.length ? pingGroupChecked : groupedPings}
        groupedUnassignedPings={groupedUnassignedPings}
        open={showExportModal}
        handleClose={(): void => setShowExportModal(false)}
        range={timeRange}
      />
    </Box>
  );
}
