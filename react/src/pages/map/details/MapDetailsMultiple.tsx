import { ITelemetryDetail, IUniqueFeature } from 'types/map';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper, InputLabel } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';

export type MapMultipleSelected = {
  handleCritterClick: (critter_id: string) => void;
  features: IUniqueFeature[];
};

export default function MapDetailsMultiple(props: MapMultipleSelected): JSX.Element {
  const { features, handleCritterClick } = props;

  return (
    <Box p={3}>
      <TableContainer component={Paper}>
        <Table>
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
    </Box>
  );
}

type IRowProps = {
  rowIndex: number;
  row: ITelemetryDetail;
  count: number;
  handleCritterClick: (critter_id: string) => void;
};
function Row(props: IRowProps): JSX.Element {
  const { row, rowIndex, count, handleCritterClick } = props;
  return (
    <TableRow hover className={'details-multiple'} onClick={(): void => handleCritterClick(row.critter_id)}>
      <div className={'details-multiple-row-header'}>
        <TableCell>
          {rowIndex % 2 === 0 ? <ErrorIcon className={'details-warning-icon'} htmlColor='orange' /> : null}
          <strong>{row.animal_id}</strong>
        </TableCell>
        <TableCell>{count} Points</TableCell>
      </div>
      <div className={'details-multiple-row-body'}>
        <TableCell>
          <span className={'details-multiple-cell-span'}>WLH ID:</span>
          <span className='details-multiple-cell-right'>{row.wlh_id}</span>
        </TableCell>
        <TableCell>
          <span className={'details-multiple-cell-span'}>Device ID:</span>
          <span className='details-multiple-cell-right'>{row.device_id}</span>
        </TableCell>
        <TableCell>
          <span className={'details-multiple-cell-span'}>Frequency:</span>
          <span className='details-multiple-cell-right'>{row.frequency}</span>
        </TableCell>
      </div>
    </TableRow>
  );
}
