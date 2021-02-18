import { ITelemetryFeature } from 'types/map';
import { TableRow, TableCell, TableBody, Table, Box } from '@material-ui/core';
import { formatTableCell } from "components/table/table_helpers";
import { columnToHeader } from "utils/common";
import { ShowGeometryIndividual } from "./GeometryDetails";

export type TabPanelBaseProps = {
  index: number;
  value: number;
  display: string[];
}

type TabPanelIndividualSelected = TabPanelBaseProps & {
  feature: ITelemetryFeature;
}

export default function TabIndividual(props: TabPanelIndividualSelected): JSX.Element {
  const { feature, value, index, display } = props;

  if (!feature) {
    return null;
  }
  const { properties, id, geometry} = feature;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box p={3} className={'details-single'}>
          <ShowGeometryIndividual point={geometry as GeoJSON.Point} />
          <Table>
            {/* <TableHead> </TableHead> */}
            <TableBody>
              {Object.keys(properties)
                .filter((a) => display.includes(a))
                .map((k) => {
                  const { value } = formatTableCell(properties, k);
                  if (!value) {
                    return null;
                  }
                  return (
                    <TableRow key={`${id}_${k}`}>
                      <TableCell><strong>{columnToHeader(k)}</strong></TableCell>
                      <TableCell align='right'>{value}</TableCell>
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