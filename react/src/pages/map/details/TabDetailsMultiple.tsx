import { ITelemetryDetails, ITelemetryFeature } from 'types/map';
import { TableRow, TableCell, TableBody, Table, Box, TableHead } from '@material-ui/core';
import { formatTableCell } from 'components/table/table_helpers';
import { columnToHeader } from 'utils/common';
import { TabPanelBaseProps } from './TabDetailsIndividual';

type TabPanelMultipleSelected = TabPanelBaseProps & {
  displayType: 'critter_id' | 'collar_id';
  features: ITelemetryFeature[];
};

export default function TabMultiple(props: TabPanelMultipleSelected): JSX.Element {
  const { features, value, index, displayType, display } = props;

  if (!features && features.length) {
    return null;
  }
  const uniqueFeatures: ITelemetryDetails[] = [];
  features.forEach((f) => {
    const detail: ITelemetryDetails = f.properties;
    const found = uniqueFeatures.find((c) => c[displayType] === detail[displayType]);
    if (!found) {
      uniqueFeatures.push(detail);
    }
  });
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box p={3}>
          {/* <ShowGeometryIndividual point={geometry as GeoJSON.Point} /> */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>MetaData</b></TableCell>
                <TableCell><b>Individual</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {display.map((prop, idx) => {
                return (
                  <TableRow key={`header-${prop}-${idx}`}>
                    <TableCell>
                      <strong>{columnToHeader(prop)}</strong>
                    </TableCell>
                    {uniqueFeatures.map((feature) => {
                      const { value } = formatTableCell(feature, prop);
                      return <TableCell key={`body-${prop}-${idx}`}>{value}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </div>
  );
}
