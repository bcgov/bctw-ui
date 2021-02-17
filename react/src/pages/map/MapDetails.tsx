import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

type MapDetailsProps = {
  selectedCollars: any[];
}
export default function MapDetails(props: MapDetailsProps): JSX.Element {
  const { selectedCollars } = props;
  function createData(name, status) {
    return { name, status };
  }
  const rows = [createData('Caribou', 'Status'), createData('Wolf', 'Status'), createData('Caribou', 'Status')];

  return (
    <div className={'side-panel'}>
      <h1 className={'side-panel-title'}>Selected Telemetry</h1>
      <div className={'results-container'} id='collar-list'>
        <div className={'results-title'}>
          Results <span>(0)</span>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Animal</TableCell>
              <TableCell align='right'>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component='th' scope='row'>
                  {row.name}
                </TableCell>
                <TableCell align='right'>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ul>
          {selectedCollars.map((collar) => (
            <li key={collar}>{collar}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
