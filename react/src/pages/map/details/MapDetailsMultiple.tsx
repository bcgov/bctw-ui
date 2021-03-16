import { ITelemetryDetail, IUniqueFeature, OnCritterRowClick, OnPanelRowHover } from 'types/map';
import { TableRow, TableCell, TableBody, Table, TableContainer, Paper, TableHead } from '@material-ui/core';

export type MapMultipleSelected = {
  handleCritterHover: OnPanelRowHover;
  handleCritterClick: OnCritterRowClick;
  features: IUniqueFeature[];
  crittersSelected: string[];
};

export default function MapDetailsMultiple(props: MapMultipleSelected): JSX.Element {
  const { features, crittersSelected, handleCritterClick, handleCritterHover } = props;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Critter Name</b></TableCell>
            <TableCell><b>WLH ID</b></TableCell>
            <TableCell><b>Device ID</b></TableCell>
            <TableCell><b>Frequency</b></TableCell>
            <TableCell><b>Total Points</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((u) => {
            return (
              <Row
                key={u.critter_id}
                pointIDs={u.features.map(f => f.id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                // fixme: why only the details of the first feature when this can be different?
                row={u.features[0].properties}
                handleCritterClick={handleCritterClick}
                handleCritterHover={handleCritterHover}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type IRowProps = {
  pointIDs: number[];
  isSelectedInMap: boolean;
  row: ITelemetryDetail;
  handleCritterClick: OnCritterRowClick;
  handleCritterHover: OnPanelRowHover;
};
function Row(props: IRowProps): JSX.Element {
  const { row, handleCritterClick, isSelectedInMap, pointIDs, handleCritterHover } = props;
  return (
    <TableRow
      hover
      className={`map-bottom-panel-row ${isSelectedInMap ? 'bottom-panel-row-is-map-selected' : ''}`}
      onMouseEnter={(): void => handleCritterHover(pointIDs)}
      onMouseLeave={(): void => handleCritterHover([])}
    >
      <TableCell className={'critter-select'} onClick={(): void => handleCritterClick(row)}>
        {row.animal_id ?? 'unknown'}
      </TableCell>
      <TableCell>{row.wlh_id}</TableCell>
      <TableCell>{row.device_id}</TableCell>
      <TableCell>{row.frequency}</TableCell>
      <TableCell>{pointIDs.length}</TableCell>
    </TableRow>
  );
}
