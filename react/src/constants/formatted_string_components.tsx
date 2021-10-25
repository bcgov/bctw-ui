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

export { critterImportMessage, deviceImportMessage, bothImportMessage, pointImportMessage, releaseUnattachWarning };
