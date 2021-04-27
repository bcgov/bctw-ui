import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useState } from 'react';

type IMapLayerToggleControlProps = {
  handleToggleTracks: (b: boolean) => void;
  handleTogglePings: (b: boolean) => void;
};
export default function MapLayerToggleControl({handleTogglePings, handleToggleTracks}: IMapLayerToggleControlProps): JSX.Element {
  const [showTracks, setShowTracks] = useState(true);
  const [showPings, setShowPings] = useState(true);

  const handleTracksChange = (e): void => {
    const b = e.target.checked;
    setShowTracks(o => !o);
    handleToggleTracks(!b);
  };

  const handlePingsChange = (e): void => {
    const b = e.target.checked;
    setShowPings(o => !o);
    handleTogglePings(!b);
  };

  return (
    <div className='map-layer-toggle-grp '>
      <FormControlLabel
        labelPlacement='end'
        label='Tracks'
        control={<Checkbox checked={showTracks} color='primary' value={showTracks} onClick={handleTracksChange} />}
      />
      <FormControlLabel
        labelPlacement='end'
        label='Locations'
        control={<Checkbox checked={showPings} color='primary' value={showPings} onClick={handlePingsChange} />}
      />
    </div>
  );
}
