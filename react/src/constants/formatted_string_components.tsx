const releaseUnattachWarning = (device: number, aid: string, wlhid: string): JSX.Element => (
  <>
    <h4>
      <i>Warning:</i> This action will remove device {device} from animal ID {aid} / WLH ID {wlhid}
    </h4>
    <p>You can attach a new device via the Device Assignment button at the top of the animal details page</p>
  </>
);

export { releaseUnattachWarning };
