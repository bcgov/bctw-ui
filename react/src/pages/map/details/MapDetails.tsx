import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { DetailsSortOption, ITelemetryPoint, ITelemetryGroup, OnPanelRowSelect, OnMapRowCellClick, OnlySelectedCritters } from 'types/map';
import Checkbox from 'components/form/Checkbox';
import { getPointIDsFromTelemetryGroup, getUniqueCritterIDsFromSelectedPings, groupPings } from '../map_helpers';
import MapExport from 'pages/map/MapExport';
import { Button } from '@material-ui/core';
import { MapStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { LightTooltip } from 'components/modal/Tooltip';

export type MapDetailsBaseProps = {
  handleRowSelected: OnPanelRowSelect;
  handleShowOverview: OnMapRowCellClick;
};

type MapDetailsProps = MapDetailsBaseProps & {
  pings: ITelemetryPoint[];
  unassignedPings: ITelemetryPoint[];
  selectedAssignedIDs: number[];
  showExportModal: boolean;
  setShowExportModal: (b: boolean) => void;
  handleShowOnlySelected: (o: OnlySelectedCritters) => void;
};

export default function MapDetails({
  pings,
  unassignedPings,
  selectedAssignedIDs,
  handleShowOverview,
  handleShowOnlySelected,
  handleRowSelected,
  showExportModal,
  setShowExportModal
}: MapDetailsProps): JSX.Element {
  const [groupedPings, setGroupedPings] = useState<ITelemetryGroup[]>([]);
  const [groupedUnassignedPings, setGroupedUnassignedPings] = useState<ITelemetryGroup[]>([]);
  const [crittersSelectedInMap, setCrittersSelectedInMap] = useState<string[]>([]);
  // for export state
  const [pingGroupChecked, setPingGroupChecked] = useState<ITelemetryGroup[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [sort] = useState<DetailsSortOption>('wlh_id');

  // upon initial load, display all critters in bottom panel
  useEffect(() => {
    const byCritter = groupPings(pings, sort);
    const byDevice = groupPings(unassignedPings, sort, 'collar_id').filter(g => !g.critter_id);
    setGroupedPings(byCritter);
    setGroupedUnassignedPings(byDevice);
  }, [pings]);

  // when user limits features selection via the map
  // highlight them in child details component
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
      handleRowsChecked(getPointIDsFromTelemetryGroup(pingGroupChecked))
    }
  }, [showOnlySelected])

  // upon rows checked in each row
  const handleRowsChecked = (ids: number[]): void => {
    const grouped = groupPings(pings.filter((f) => ids.includes(f.id)));
    setPingGroupChecked(grouped);
    handleRowSelected(ids);
    if (showOnlySelected) {
      handleShowOnlySelected({show: true, critter_ids: grouped.map(g => g.critter_id)});
    }
  };

  const handleShowSelectedChecked = (val: Record<string, boolean>): void => {
    const isChecked = val[MapStrings.showOnlyCheckedLabel];
    setShowOnlySelected(isChecked);
    // call the parent handler
    handleShowOnlySelected({show: isChecked, critter_ids: pingGroupChecked.map(g => g.critter_id)});
  }

  return (
    <>
      <div className={'map-bottom-panel-title'}>

        <LightTooltip title={
          <>
            <p>{MapStrings.showOnlyCheckedTooltip}</p>
          </>
        } placement='left-start' enterDelay={750}>
          <span>
            <Checkbox
              label={MapStrings.showOnlyCheckedLabel}
              initialValue={false}
              changeHandler={handleShowSelectedChecked}
            />
          </span>
        </LightTooltip>
        <Button color='primary' onClick={(): void => setShowExportModal(true)} variant='outlined'>Export</Button>
      </div>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        pings={[...groupedPings, ...groupedUnassignedPings]}
        handleShowOverview={handleShowOverview}
        handleRowSelected={handleRowsChecked}
      />
      <MapExport
        critter_ids={
          pingGroupChecked.length
            ? pingGroupChecked.map((g) => g.critter_id)
            : groupedPings.map((f) => f.critter_id)
        }
        collar_ids={
          pingGroupChecked.length
            ? pingGroupChecked.map((f) => f.features[0].properties.collar_id)
            : groupedPings.map((f) => f.features[0].properties.collar_id)
        }
        open={showExportModal}
        handleClose={(): void => setShowExportModal(false)}
      />
    </>
  );
}
