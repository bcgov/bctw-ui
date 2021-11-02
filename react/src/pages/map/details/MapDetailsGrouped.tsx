import { ITelemetryDetail, ITelemetryGroup, OnMapRowCellClick, TelemetryDetail } from 'types/map';
import { Box, TableRow, TableCell, TableBody, Table, TableContainer, Paper, Checkbox } from '@mui/material';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';
import {
  getPointIDsFromTelemetryGroup,
  getLatestPing,
  sortGroupedTelemetry,
  parseAnimalColour
} from 'pages/map/map_helpers';
import { MapDetailsBaseProps } from './MapDetails';

export type MapDetailsGroupedProps = MapDetailsBaseProps & {
  pings: ITelemetryGroup[];
  crittersSelected: string[];
};

type GroupedCheckedStatus = {
  critter_id: string;
  checked: boolean;
};

const rows_to_render = [
  'Colour',
  'Species',
  'Population Unit',
  'Collective Unit',
  'WLH ID',
  'Animal ID',
  'Animal Status',
  'Device ID',
  'Device Status',
  'Frequency (MHz)',
  'Capture Date',
  'Last Transmit Date'
];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { pings, crittersSelected, handleShowOverview, handleRowSelected } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState('Critter Name');
  const [checkedGroups, setCheckedGroups] = useState<string[]>([]);

  const handleSort = (event: React.MouseEvent<unknown>, property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    const newChecked = val ? pings.map((f) => f.critter_id) : [];
    pushRowCheck(newChecked);
  };

  const handleRowCheck = (v: GroupedCheckedStatus): void => {
    let newChecked = null;
    const idxFound = checkedGroups.indexOf(v.critter_id);
    if (idxFound === -1) {
      newChecked = [...checkedGroups, v.critter_id];
    } else {
      const cp = [...checkedGroups];
      cp.splice(idxFound, idxFound + 1);
      if (v.checked) {
        cp.push(v.critter_id);
      }
      newChecked = cp;
    }
    pushRowCheck(newChecked);
  };

  const pushRowCheck = (ids: string[]): void => {
    setCheckedGroups(ids);
    const pointIDs = getPointIDsFromTelemetryGroup(pings.filter((f) => ids.includes(f.critter_id)));
    handleRowSelected(pointIDs);
  };

  const totalPointCount = (): number => pings.reduce((accum, cur) => cur.count + accum, 0);

  return (
    <TableContainer component={Paper} className={'map-detail-table-container'}>
      <Table stickyHeader size='small'>
        {pings && pings.length ? (
          <TableHead
            headersToDisplay={[...rows_to_render, `Point Count (${totalPointCount()})`] as any}
            headerData={plainToClass(TelemetryDetail, pings[0].features[0].properties) as TelemetryDetail}
            numSelected={checkedGroups.length}
            order={order}
            orderBy={orderBy ?? ''}
            onRequestSort={handleSort}
            rowCount={pings.length}
            isMultiSelect={true}
            onSelectAllClick={handleSelectAllClick}
            customHeaders={[]}
          />
        ) : null}
        <TableBody>
          {sortGroupedTelemetry(pings, getComparator(order, orderBy)).map((u, idx) => {
            return (
              <Row
                key={`${idx}_${u.device_id}`}
                pingCount={u.features.length}
                isChecked={checkedGroups.includes(u.critter_id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                // fixme: should it be the latest props that are displayed?
                row={plainToClass(TelemetryDetail, getLatestPing(u.features)?.properties)}
                handleShowOverview={handleShowOverview}
                handleRowCheck={handleRowCheck}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type MapDetailsTableRowProps = {
  pingCount: number;
  isSelectedInMap: boolean;
  isChecked: boolean;
  row: TelemetryDetail;
  handleRowCheck: (v: GroupedCheckedStatus) => void;
  handleShowOverview: OnMapRowCellClick;
};

function Row(props: MapDetailsTableRowProps): JSX.Element {
  const { row, handleRowCheck, handleShowOverview, isSelectedInMap, pingCount, isChecked } = props;

  const onCheck = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    handleRowCheck({ critter_id: row.critter_id, checked: val });
  };

  return (
    <TableRow
      hover={!isSelectedInMap}
      className={`map-bottom-panel-row ${isSelectedInMap ? 'row-selected' : ''}`}>
      <TableCell padding='checkbox'>
        <Checkbox color='primary' onChange={onCheck} checked={isChecked} />
      </TableCell>
      <TableCell>
        <Box className='colour-swatch'
          style={{ width: '32px', height: '32px', border: '1px solid #999999',
            backgroundColor: parseAnimalColour(row.map_colour).fillColor}}>
        </Box>
      </TableCell>
      <TableCell>{row.species}</TableCell>
      <TableCell>{row.population_unit}</TableCell>
      <TableCell>{row.collective_unit}</TableCell>
      {row.critter_id ? (
        <CellWithLink row={row} propName={'wlh_id'} onClickLink={(): void => handleShowOverview('animal', row)} />
      ) : (
        <TableCell></TableCell>
      )}
      {row.critter_id ? (
        <CellWithLink row={row} propName={'animal_id'} onClickLink={(): void => handleShowOverview('animal', row)} />
      ) : (
        <TableCell></TableCell>
      )}
      <TableCell>{row.animal_status}</TableCell>
      <CellWithLink row={row} propName={'device_id'} onClickLink={(): void => handleShowOverview('device', row)} />
      <TableCell>{row.device_status}</TableCell>
      <TableCell>{row.paddedFrequency}</TableCell>
      <TableCell>{row.formattedCaptureDate}</TableCell>
      <TableCell>{row.formattedDate}</TableCell>
      <TableCell>{pingCount}</TableCell>
    </TableRow>
  );
}

type TableCellLinkProps = {
  row: ITelemetryDetail;
  propName: string;
  onClickLink: () => void;
};
// table cell component that contains 'button' to open map overview page when clicked
function CellWithLink({ row, propName, onClickLink }: TableCellLinkProps): JSX.Element {
  return (
    <TableCell className={row[propName] ? '' : 'cell-hover'} onClick={row[propName] ? null : onClickLink}>
      <div onClick={row[propName] ? onClickLink : null} className={'cell-clickable'}>
        {row[propName] ?? ''}
      </div>
    </TableCell>
  );
}
