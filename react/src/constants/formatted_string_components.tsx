import { Typography } from '@mui/material';

const releaseUnattachWarning = (device: number, aid: string, wlhid: string): JSX.Element => (
  <>
    <h4>
      <i>Warning:</i> This action will remove device {device} from animal ID {aid} / WLH ID {wlhid}
    </h4>
    <p>You can attach a new device via the Device Assignment button at the top of the animal details page</p>
  </>
);

const taxonModalMessage = (currenttaxon: string, nexttaxon: string): JSX.Element => {
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
  const sArr = diff(values[currenttaxon], values[nexttaxon]);
  return (
    <Typography variant='subtitle1' style={{ textAlign: 'center', margin: 20 }}>
      Switching to taxon <b>{`'${nexttaxon}'`}</b> could remove previously saved attributes
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

export { releaseUnattachWarning, taxonModalMessage };
