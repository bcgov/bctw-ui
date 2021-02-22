import { ITelemetryDetails, ITelemetryFeature } from 'types/map';
import { IconButton, TableRow, TableCell, TableBody, Table, Box, TableHead, Collapse, Typography, TableContainer, Paper } from '@material-ui/core';
// import { formatTableCell } from 'components/table/table_helpers';
// import { columnToHeader } from 'utils/common';
import { useState } from 'react';
import { TabPanelBaseProps } from './TabDetailsIndividual';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { formatDateStr } from 'utils/time';

type TabPanelMultipleSelected = TabPanelBaseProps & {
  displayType: 'critter_id' | 'collar_id';
  features: ITelemetryFeature[];
};

export default function TabMultiple(props: TabPanelMultipleSelected): JSX.Element {
  const { features, value, index, displayType } = props;

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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell><b>Device Details</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  uniqueFeatures.map((v) =>{
                    return (
                      <Row row={v} />
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </div>
  );
}

type IRowProps = {
  row: ITelemetryDetails;
}
function Row(props: IRowProps ): JSX.Element {
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
        <TableCell>Device <b>{row.device_id}</b> frequency: <b>{row.radio_frequency}</b></TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Animal ID</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
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