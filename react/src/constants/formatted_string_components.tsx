const critterImportMessage = (
  <>
    <h4>Add or update animals.</h4>
    <p>
      <i><b>animal_id</b> AND <b>wlh_id</b> OR <b>critter_id</b></i> must be included for the importer to perform an
      update to an existing animal.<br></br>
      If <i><b>device_id</b></i> is present, the importer will attempt to attach the collar to the device. The device must
      first exist.
    </p>
  </>
);

const deviceImportMessage = (
  <>
    <h4>Add or update devices</h4>
    <p><i><b>device_id</b> AND <b>device_make</b></i> must be included.</p>
    <p>todo: move vectronic keyx import here?</p>
  </>
)

const bothImportMessage = (
  <>
    <h4>Add or update animal and device metadata at the same time from the same row.</h4>
    <p>todo: Add details here about capture/mort dates etc.</p>
  </>
)

const pointImportMessage = (
  <>
    <h4>Add historical telemetry data</h4>
    <p><i><b>device_id, date_recorded, device_vendor, latitude, longitude</b></i> must be included.</p>
    <p>Note that this data will not be available for viewing on the map until tomorrow</p>
  </>
)

export { critterImportMessage, deviceImportMessage, bothImportMessage, pointImportMessage };
