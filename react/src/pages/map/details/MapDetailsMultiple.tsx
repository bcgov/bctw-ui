import { ITelemetryDetail } from 'types/map';
import { Button, TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import { IUniqueFeature } from '../map_helpers';

export type MapMultipleSelected = {
  handleCritterClick: () => void;
  features: IUniqueFeature[];
};

export default function MapDetailsMultiple(props: MapMultipleSelected): JSX.Element {
  const { features, handleCritterClick } = props;
  return (
    <Box p={3}>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {features.map((u) => {
              return (
                <Row
                  key={u.critter_id}
                  count={u.count}
                  row={u.features[0].properties}
                  handleCritterClick={handleCritterClick}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

type IRowProps = {
  row: ITelemetryDetail;
  count: number;
  handleCritterClick: () => void;
};
function Row(props: IRowProps): JSX.Element {
  const { row, count, handleCritterClick } = props;
  return (
    <Button className='details-mult-btn' onClick={handleCritterClick}>
      <TableRow className={'details-mult'}>
        <div className={'details-multiple-row-header'}>
          <TableCell>
            <ErrorIcon className={'details-warning-icon'} htmlColor='orange' />
            <strong>{row.animal_id}</strong>
          </TableCell>
          <TableCell>{count} Points</TableCell>
        </div>
        <div className={'details-multiple-row-body'}>
          <TableCell>
            <span className='details-multiple-cell-span'>WLH ID</span>
            {row.wlh_id}
          </TableCell>
          <TableCell>
            <span className='details-multiple-cell-span'>Device ID</span>
            {row.device_id}
          </TableCell>
          <TableCell>
            <span className='details-multiple-cell-span'>Frequency</span>
            {row.frequency}
          </TableCell>
        </div>
        {/* <TableCell style={{ width: 40 }}>
          <IconButton size='small' onClick={(): void => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          Device <b>{row.device_id}</b> frequency: <b>{row.frequency}</b>
        </TableCell> */}
      </TableRow>
    </Button>
  );
}
// function Row(props: IRowProps): JSX.Element {
//   const { row } = props;
//   const [open, setOpen] = useState(false);
//   if (row){
//     console.log(row)
//   }

//   return (
//     <>
//       <TableRow>
//         <TableCell style={{ width: 40 }}>
//           <IconButton size='small' onClick={(): void => setOpen(!open)}>
//             {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </TableCell>
//         <TableCell>
//           Device <b>{row.device_id}</b> frequency: <b>{row.frequency}</b>
//         </TableCell>
//       </TableRow>
//       <TableRow>
//         <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
//           <Collapse in={open} timeout='auto' unmountOnExit>
//             <Box margin={1}>
//               <Table size='small'>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>
//                       <strong>Animal ID</strong>
//                     </TableCell>
//                     <TableCell>
//                       <strong>Status</strong>
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell>{row.animal_id ?? 'unknown'}</TableCell>
//                     <TableCell>{row.animal_status ?? 'unknown'}</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </>
//   );
// }
