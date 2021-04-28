import { useState } from 'react';
import { LocationOn, Timeline } from '@material-ui/icons';

type IMapLayerToggleControlProps = {
  handleToggleTracks: (b: boolean) => void;
  handleTogglePings: (b: boolean) => void;
};
export default function MapLayerToggleControl({
  handleTogglePings,
  handleToggleTracks
}: IMapLayerToggleControlProps): JSX.Element {
  const [showTracks, setShowTracks] = useState(true);
  const [showPings, setShowPings] = useState(true);

  const toggleTracks = (): void => {
    const cur = showTracks;
    setShowTracks(!cur);
    handleToggleTracks(!cur);
  };

  const togglePings = (): void => {
    const cur = showPings;
    setShowPings(!cur);
    handleTogglePings(!cur);
  };

  return (
    <>
      <div className={`map-icon map-toggle-tracks-btn ${showTracks ? 'icon-on' : 'icon-off'}`} onClick={toggleTracks} title={'Toggle Tracks'}>
        {<Timeline />}
      </div>
      <div className={`map-icon map-toggle-pings-btn ${showPings ? 'icon-on' : 'icon-off'}`} onClick={togglePings} title={'Toggle Locations'}>
        {<LocationOn />}
      </div>
    </>
  );
}
