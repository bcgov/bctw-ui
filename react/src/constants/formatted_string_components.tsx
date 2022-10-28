import { Button, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Icon } from 'components/common';
import { getTag } from 'components/table/table_helpers';
import { AnimalNotification, MortalityAlert } from 'types/alert';
import { AttachedAnimal } from 'types/animal';
import { eDeviceStatus } from 'types/collar';

const critterImportMessage = (
  <>
    <h4>Add or update animals.</h4>
    <p>
      <i>
        <b>critter_id</b>
      </i>{' '}
      must be included for the importer to perform an update to an existing animal.<br></br>
      If{' '}
      <i>
        <b>device_id</b>
      </i>{' '}
      is present, the importer will attempt to attach the collar to the device. The device must exist.
    </p>
  </>
);

const deviceImportMessage = (
  <>
    <h4>Add or update devices</h4>
    <p>
      <i>
        <b>device_id</b> AND <b>device_make</b>
      </i>{' '}
      must be included.
    </p>
  </>
  // <p>todo: move vectronic keyx import here?</p>
);

const bothImportMessage = (
  <h4>Add or update animal and device metadata from the same row.</h4>
  // <p>todo: Add details here about capture/mort dates etc.</p>
);

const pointImportMessage = (
  <>
    <h4>Add historical telemetry data</h4>
    <p>
      <i>
        <b>device_id, date_recorded, device_vendor, latitude, longitude</b>
      </i>{' '}
      must be included.
    </p>
    <p>Note that this data will not be available for viewing on the map until tomorrow</p>
  </>
);

const releaseUnattachWarning = (device: number, aid: string, wlhid: string): JSX.Element => (
  <>
    <h4>
      <i>Warning:</i> This action will remove device {device} from animal ID {aid} / WLH ID {wlhid}
    </h4>
    <p>You can attach a new device via the Device Assignment button at the top of the animal details page</p>
  </>
);

const animalBannerMortNotif = (notif: AnimalNotification) => (
  <ListItem>
    <ListItemIcon>{getTag(notif.device_status as eDeviceStatus)}</ListItemIcon>
    <ListItemText
      primary={
        <Typography>
          The status of <b>Device ID:</b> {notif.device_id} changed from 'Alive' to '<b>{notif.device_status}</b>' on
          DATE
        </Typography>
      }
      secondary={
        <>
          <b>Frequency:</b> {notif.frequency} <b>Animal ID:</b> {notif.animal_id} <b>WLH ID:</b> {notif.wlh_id}
        </>
      }
    />
  </ListItem>
);

const animalMenuMortNotif = (notif: MortalityAlert) => (
  <ListItem>
    <ListItemIcon>
      <Icon icon={'circle'} />
    </ListItemIcon>
    <ListItemText
      primary={
        <Typography>
          {notif.species} mortality alert from Device {notif.device_id} on Animal {notif.wlh_id}.
        </Typography>
      }
      secondary={<>{notif.valid_from}</>}
    />
  </ListItem>
);

const speciesModalMessage = (currentSpecies: string, nextSpecies: string): JSX.Element => {
  const diff = (a?: string[], b?: string[]): string[] => (!a || !b ? null : a.filter((v) => !b.includes(v)));
  const WMU = 'Wildlife Management Unit';
  const MLS = 'Moose Life Stage';
  const PU = 'Population Unit';

  const values = {
    Moose: [WMU, MLS],
    Caribou: [PU],
    'Grey Wolf': [WMU],
    'Grizzly Bear': [WMU]
  };
  const sArr = diff(values[currentSpecies], values[nextSpecies]);
  return (
    <Typography variant='subtitle1' style={{ textAlign: 'center', margin: 20 }}>
      Switching to species <b>{`'${nextSpecies}'`}</b> could remove previously saved attributes
      {sArr && !!sArr?.length && (
        <Typography style={{ textAlign: 'center' }}>
          {sArr.map((s: string) => `'${s}' `).join(', ')}
          might be removed.
          {/* <b>'Population Unit'</b>, <b>'Wildlife Management Unit'</b>, <br/>
      <b> 'Life Stage'</b> and <b>'Moose Life Stage'</b> might be removed */}
        </Typography>
      )}
      <br />
      <Typography style={{ textAlign: 'center', fontWeight: 'bold' }}>Are you sure you want to do this?</Typography>
    </Typography>
  );
};

export {
  critterImportMessage,
  deviceImportMessage,
  bothImportMessage,
  pointImportMessage,
  releaseUnattachWarning,
  speciesModalMessage,
  animalBannerMortNotif,
  animalMenuMortNotif
};
