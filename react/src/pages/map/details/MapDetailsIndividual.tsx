import { ITelemetryFeature, TelemetryFeature, TelemetryDetail } from 'types/map';
import { TableRow, TableCell, TableBody, Table, Box } from '@material-ui/core';
import { formatTableCell } from 'components/table/table_helpers';
import { plainToClass } from 'class-transformer';

type TabPanelIndividualSelected = {
  feature: ITelemetryFeature;
};

export default function MapDetailsIndividual(props: TabPanelIndividualSelected): JSX.Element {
  const { feature } = props;

  if (!feature) {
    return null;
  }
  const { properties } = feature;

  const featureInstance = plainToClass(TelemetryFeature, feature);
  const detailInstance = plainToClass(TelemetryDetail, properties);
  const id = featureInstance.id;

  return (
    <Box p={3} className={'details-single'}>
      <Table>
        <TableBody>
          {mapFeature(detailInstance, id, ['species', 'wlh_id', 'animal_id'])}
          {formatGetter(detailInstance.formattedDevice, 'Device')}
          {mapFeature(detailInstance, id, [
            'radio_frequency',
            'animal_status',
            'collar_status',
            'population_unit',
            'management_unit'
          ])}
          {formatGetter(featureInstance.location, 'Location')}
          {formatGetter(detailInstance.formattedDate, 'Date Recorded')}
        </TableBody>
      </Table>
    </Box>
  );
}

const formatGetter = (getter: any, header: string): JSX.Element => (
  <TableRow>
    <TableCell>
      <strong>{header}</strong>
    </TableCell>
    <TableCell align='right'>{getter}</TableCell>
  </TableRow>
);

const mapFeature = (detail: TelemetryDetail, id: any, toDisplay: string[]): JSX.Element => {
  return (
    <>
      {Object.keys(detail)
        .filter((a) => toDisplay.includes(a))
        .map((k) => {
          const { value } = formatTableCell(detail, k);
          return (
            <TableRow key={`${id}_${k}`}>
              <TableCell>
                <strong>{detail.formatPropAsHeader(k)}</strong>
              </TableCell>
              <TableCell align='right'>{value ?? 'unknown'}</TableCell>
            </TableRow>
          );
        })}
    </>
  );
};
