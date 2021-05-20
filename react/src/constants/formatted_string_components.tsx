const critterImportMessage = (
  <>
    <h4>Use this feature to add or update animals.</h4>
    <p>
      <i><b>animal_id</b> AND <b>wlh_id</b> OR <b>critter_id</b></i> must be included for the importer to perform an
      update to an existing animal.<br></br>
      If <i><b>device_id</b></i> is present, the importer will attempt to attach the collar to the device. The device must
      first exist.
    </p>
  </>
);

export { critterImportMessage };
