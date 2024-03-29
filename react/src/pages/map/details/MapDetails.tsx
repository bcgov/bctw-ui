import { Box } from '@mui/material';
import { MapStrings } from 'constants/strings';
import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { DetailsSortOption, ITelemetryGroup, ITelemetryPoint, OnMapRowCellClick } from 'types/map';
import { groupPings } from '../map_helpers';

export type MapDetailsBaseProps = {
  handleShowOverview: OnMapRowCellClick;
};

type MapDetailsProps = MapDetailsBaseProps & {
  pings: ITelemetryPoint[];
  unassignedPings: ITelemetryPoint[];
};

/**
 * the bottom details panel (aka attribute table) of the 2D map
 * note: fixme: unassigned points not handled correctly for all features!
 */
export default function MapDetails({ pings, unassignedPings, handleShowOverview }: MapDetailsProps): JSX.Element {
  // ping state from the map. Applying filters will update this state
  const [groupedPings, setGroupedPings] = useState<ITelemetryGroup[]>([]);
  const [groupedUnassignedPings, setGroupedUnassignedPings] = useState<ITelemetryGroup[]>([]);

  const [sort] = useState<DetailsSortOption>('wlh_id');

  // upon initial load, display all critters in bottom panel
  useEffect(() => {
    const byCritter = groupPings(pings, sort);
    const byDevice = groupPings(unassignedPings, sort, 'collar_id').filter((g) => !g.critter_id);
    setGroupedPings(byCritter);
    setGroupedUnassignedPings(byDevice);
  }, [pings]);

  if (!groupedPings.length && !groupedUnassignedPings.length) {
    return (
      <Box
        color='orangered'
        className={'map-detail-container'}
        display='flex'
        alignItems={'center'}
        justifyContent={'center'}>
        <p style={{ fontSize: '18px', fontWeight: 'bolder' }}>{MapStrings.noCrittersFound}</p>
      </Box>
    );
  }

  return (
    <Box className={'map-detail-container'} display='flex' flexDirection='column'>
      <MapDetailsGrouped pings={[...groupedPings, ...groupedUnassignedPings]} handleShowOverview={handleShowOverview} />
    </Box>
  );
}
