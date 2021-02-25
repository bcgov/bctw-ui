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
          {mapFeature(detailInstance, id, [{ field: 'species' }, { field: 'wlh_id' }, { field: 'animal_id' }])}
          {formatGetter(detailInstance.formattedDevice, 'Device')}
          {mapFeature(detailInstance, id, [
            { field: 'radio_frequency' },
            { field: 'animal_status', highlight: true },
            { field: 'collar_status', highlight: true },
            { field: 'population_unit' },
            { field: 'management_area' }
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

type DisplayUnit = {
  field: string;
  highlight?: boolean;
};

const mapFeature = (detail: TelemetryDetail, id: any, toDisplay: DisplayUnit[]): JSX.Element => {
  return (
    <>
      {Object.keys(detail)
        .filter((a) => toDisplay.map((td) => td.field).includes(a))
        .map((k) => {
          const highlightIt: boolean = toDisplay.find(f => f.field === k)?.highlight;
          const { value } = formatTableCell(detail, k);
          return (
            <TableRow key={`${id}_${k}`}>
              <TableCell>
                <strong>{detail.formatPropAsHeader(k)}</strong>
              </TableCell>
              <TableCell className={highlightIt ? 'details-individual-prominent' : ''} align='right'>{value ?? 'unknown'}</TableCell>
            </TableRow>
          );
        })}
    </>
  );
};
