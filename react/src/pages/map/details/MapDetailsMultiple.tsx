import { ITelemetryDetail, ITelemetryFeature } from 'types/map';
import {
  IconButton,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Box,
  TableHead,
  Collapse,
  TableContainer,
  Paper
} from '@material-ui/core';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

type MapMultipleSelected = {
  features: ITelemetryFeature[];
};

export default function MapDetailsMultiple(props: MapMultipleSelected): JSX.Element {
  const { features } = props;

  if (!features && features.length) {
    return null;
  }
  const uniqueFeatures: ITelemetryDetail[] = [];
  features.forEach((f) => {
    const detail: ITelemetryDetail = f.properties;
    const found = uniqueFeatures.find((c) => c.critter_id === detail.critter_id);
    if (!found) {
      uniqueFeatures.push(detail);
    }
  });
  return (
    <Box p={3}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <b>Device Details</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueFeatures.map((v) => {
              return <Row row={v} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

type IRowProps = {
  row: ITelemetryDetail;
};
function Row(props: IRowProps): JSX.Element {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell style={{ width: 40 }}>
          <IconButton size='small' onClick={(): void => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          Device <b>{row.device_id}</b> frequency: <b>{row.radio_frequency}</b>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Animal ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{row.animal_id ?? 'unknown'}</TableCell>
                    <TableCell>{row.animal_status ?? 'unknown'}</TableCell>
                    {/* <TableCell align='right'>{formatDateStr((row as any).radio_frequency)}</TableCell> */}
                    {/* <TableCell align='right'>{(row as any).radio_frequency}</TableCell> */}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/* previous version with property in column 1 and value column 2 */
// <Table>
//   <TableHead>
//     <TableRow>
//       <TableCell><b>MetaData</b></TableCell>
//       <TableCell><b>Individual</b></TableCell>
//     </TableRow>
//   </TableHead>
//   <TableBody>
//     {display.map((prop, idx) => {
//       return (
//         <TableRow key={`header-${prop}-${idx}`}>
//           <TableCell>
//             <strong>{columnToHeader(prop)}</strong>
//           </TableCell>
//           {uniqueFeatures.map((feature) => {
//             const { value } = formatTableCell(feature, prop);
//             return <TableCell key={`body-${prop}-${idx}`}>{value}</TableCell>;
//           })}
//         </TableRow>
//       );
//     })}
//   </TableBody>
// </Table>
