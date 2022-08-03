import { Typography } from "@mui/material";
import { capitalize, columnToHeader } from "utils/common_helpers";

const critterImportMessage = (
  <>
    <h4>Add or update animals.</h4>
    <p>
      <i><b>critter_id</b></i> must be included for the importer to perform an update to an existing animal.<br></br>
      If <i><b>device_id</b></i> is present, the importer will attempt to attach the collar to the device. The device must exist.
    </p>
  </>
);

const deviceImportMessage = (
  <>
    <h4>Add or update devices</h4>
    <p><i><b>device_id</b> AND <b>device_make</b></i> must be included.</p>
  </>
  // <p>todo: move vectronic keyx import here?</p>
)

const bothImportMessage = (
  <h4>Add or update animal and device metadata from the same row.</h4>
  // <p>todo: Add details here about capture/mort dates etc.</p>
)

const pointImportMessage = (
  <>
    <h4>Add historical telemetry data</h4>
    <p><i><b>device_id, date_recorded, device_vendor, latitude, longitude</b></i> must be included.</p>
    <p>Note that this data will not be available for viewing on the map until tomorrow</p>
  </>
)

const releaseUnattachWarning = (device: number, aid: string, wlhid: string): JSX.Element => (
  <>
    <h4><i>Warning:</i> This action will remove device {device} from animal ID {aid} / WLH ID {wlhid}</h4>
    <p>You can attach a new device via the Device Assignment button at the top of the animal details page</p>
  </>
)

const speciesModalMessage = (species: string) => (
  <Typography variant='subtitle1' style={{textAlign: 'center', margin: 20}}>
    Switching to species <b>{`'${species}'`}</b> could remove previously saved attributes
  <Typography style={{textAlign: 'center'}}>
    <b>'Population Unit'</b>, <b>'Wildlife Management Unit'</b>, <br/>
    <b> 'Life Stage'</b> and <b>'Moose Life Stage'</b> might be removed
  </Typography><br/>
  <Typography variant="h5" style={{textAlign: 'center', fontWeight: 'bold'}}>
    Are you sure you want to do this?
  </Typography>
  </Typography>
)
export { critterImportMessage, deviceImportMessage, bothImportMessage, pointImportMessage, releaseUnattachWarning, speciesModalMessage };
