import { ITelemetryDetail, IUniqueFeature } from 'types/map';
import { TableRow, TableCell, TableBody, Table, TableContainer, Paper, TableHead } from '@material-ui/core';

export type MapMultipleSelected = {
  handleCritterClick: (row: ITelemetryDetail) => void;
  features: IUniqueFeature[];
};

export default function MapDetailsMultiple(props: MapMultipleSelected): JSX.Element {
  const { features, handleCritterClick } = props;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Critter Name</b></TableCell>
            <TableCell><b>WLH ID</b></TableCell>
            <TableCell><b>Device ID</b></TableCell>
            <TableCell><b>Frequency</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((u, idx) => {
            return (
              <Row
                rowIndex={idx}
                key={u.critter_id}
                count={u.count}
                row={u.features[0].properties}
                handleCritterClick={handleCritterClick}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type IRowProps = {
  rowIndex: number;
  row: ITelemetryDetail;
  count: number;
  handleCritterClick: (critter_id: ITelemetryDetail) => void;
};
function Row(props: IRowProps): JSX.Element {
  const { row, handleCritterClick } = props;
  return (
    <TableRow hover className={'details-multiple'}>
      <TableCell className={'critter-select'} onClick={(): void => handleCritterClick(row)}>
        {row.animal_id ?? 'unknown'}
      </TableCell>
      <TableCell>{row.wlh_id}</TableCell>
      <TableCell>{row.device_id}</TableCell>
      <TableCell>{row.frequency}</TableCell>
    </TableRow>
  );
}
