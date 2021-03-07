import { Table, TableBody, TableCell, TableRow, TableHead } from '@material-ui/core';
import { plainToClass } from 'class-transformer';
import { formatTableCell } from 'components/table/table_helpers';
import { ITelemetryFeature, IUniqueFeature, TelemetryDetail, TelemetryFeature } from 'types/map';

type MapDetailsPointsProps = {
  features: IUniqueFeature;
  onClickPoint: (f: ITelemetryFeature) => void;
};

export default function MapDetailsPoints(props: MapDetailsPointsProps): JSX.Element {
  const { features, onClickPoint } = props;
  const fList = features.features;
  if (!fList.length) {
    return null;
  }
  const first = fList[0];
  const firstDetail = first.properties;
  return (
    <>
      <p>Animal ID: {firstDetail.animal_id}</p>
      <p>Device ID: {firstDetail.device_id}</p>
      <p>Results ({fList.length})</p>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Timestamp</strong>
            </TableCell>
            <TableCell align='right'>
              <strong>Location</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fList.map((f: ITelemetryFeature) => {
            const featureInstance = plainToClass(TelemetryFeature, f);
            const detailInstance = plainToClass(TelemetryDetail, f.properties);
            return (
              <TableRow key={f.id} hover onClick={(): void => onClickPoint(f)}>
                <TableCell>{formatTableCell(detailInstance, 'date_recorded')?.value}</TableCell>
                <TableCell align='right'>{featureInstance.location}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}