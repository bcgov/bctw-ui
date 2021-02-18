import { TableRow, TableCell, TableBody, Table, Box } from '@material-ui/core';

type ShowGeometryIndividualProps = {
  point: GeoJSON.Point;
};

function ShowGeometryIndividual(props: ShowGeometryIndividualProps): JSX.Element {
  const { point } = props;
  const { coordinates } = point;
  return (
    <Box p={1} className={'geo-single'}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell><strong>Latitude:</strong></TableCell>
            <TableCell align='right'>{coordinates[1]}{coordinates[1]}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Longitude:</strong></TableCell>
            <TableCell align='right'>{coordinates[0]}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

export { ShowGeometryIndividual };
