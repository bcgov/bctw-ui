import { ITelemetryDetail, ITelemetryGroup, OnMapRowCellClick, TelemetryDetail } from 'types/map';
import { Box, TableRow, TableCell, TableBody, Table, TableContainer, Paper, Checkbox } from '@mui/material';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import {
  getPointIDsFromTelemetryGroup,
  getLatestPing,
  sortGroupedTelemetry,
  parseAnimalColour,
  getUniqueCollectionUnitKeys
} from 'pages/map/map_helpers';
import { MapDetailsBaseProps } from './MapDetails';
import { useMarkerStates } from '../MapMarkerContext';

type MapDetailsGroupedProps = MapDetailsBaseProps & {
  pings: ITelemetryGroup[];
};

type RowActionStatus = {
  critter_id: string;
  active: boolean;
};

// TODO: TelemetryDetail types
const rows_to_render = [
  'Colour',
  'Taxon',
  'WLH ID',
  'Animal ID',
  'Critter Status',
  'Device ID',
  'Device Status',
  'Frequency (MHz)',
  'Last Transmit Date'
];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { pings, handleShowOverview } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState('Critter Name');
  const [{ selectedCritters }, markerDispatch] = useMarkerStates();
  const [allSelected, setAllSelected] = useState(false);

  // Adds a column for each unique category_name
  const uniqueCategoryNames = getUniqueCollectionUnitKeys(pings);

  const handleSort = (event: React.MouseEvent<unknown>, property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    if (val) {
      setAllSelected(true);
      markerDispatch({ type: 'SELECT_MARKERS', ids: getPointIDsFromTelemetryGroup(pings) });
      markerDispatch({ type: 'SELECT_CRITTERS', ids: pings.map((p) => p.critter_id) });
    } else {
      setAllSelected(false);
      markerDispatch({ type: 'RESET_SELECTION' });
      markerDispatch({ type: 'SELECT_CRITTERS', ids: [] });
    }
  };

  const handleRowCheck = (v: RowActionStatus): void => {
    const pointIds = getPointIDsFromTelemetryGroup(pings.filter((f) => f.critter_id === v.critter_id));
    setAllSelected(false);
    markerDispatch({ type: v.active ? 'SELECT_MARKERS' : 'UNSELECT_MARKERS', ids: pointIds });
    markerDispatch({
      type: 'SELECT_CRITTERS',
      ids: v.active ? [...selectedCritters, v.critter_id] : selectedCritters.filter((id) => id !== v.critter_id)
    });
  };

  const handleRowHover = (v: RowActionStatus): void => {
    v.active ? markerDispatch({ type: 'FOCUS_CRITTER', id: v.critter_id }) : markerDispatch({ type: 'RESET_FOCUS' });
  };

  const totalPointCount = (): number => pings.reduce((accum, cur) => cur.count + accum, 0);

  return (
    <TableContainer component={Paper} className={'map-detail-table-container'}>
      <Table stickyHeader size='small'>
        {pings && pings.length ? (
          <TableHead
            headersToDisplay={
              [
                ...rows_to_render.slice(0, 2), // Display the first two headers: Colour and Taxon
                ...uniqueCategoryNames, // Insert unique category names after the Taxon header
                ...rows_to_render.slice(2), // Display the remaining headers after the unique category names
                `Point Count (${totalPointCount()})`
              ] as unknown as (keyof TelemetryDetail)[]
            }
            headerData={pings[0].features[0].properties}
            numSelected={selectedCritters.length}
            order={order}
            orderBy={orderBy ?? ''}
            onRequestSort={handleSort}
            rowCount={pings.length}
            isMultiSelect={true}
            onSelectAllClick={handleSelectAllClick}
            selectAll={allSelected}
            customHeaders={[]}
          />
        ) : null}
        <TableBody>
          {sortGroupedTelemetry(pings, getComparator(order, orderBy)).map((u, idx) => {
            return (
              <Row
                key={`${idx}_${u.device_id}`}
                pingCount={u.features.length}
                isChecked={selectedCritters.includes(u.critter_id)}
                isSelectedInMap={selectedCritters.includes(u.critter_id)}
                // fixme: should it be the latest props that are displayed?
                row={getLatestPing(u.features)?.properties}
                handleShowOverview={handleShowOverview}
                handleRowCheck={handleRowCheck}
                handleRowHover={handleRowHover}
                uniqueCategoryNames={uniqueCategoryNames}
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
  handleRowCheck: (v: RowActionStatus) => void;
  handleRowHover: (v: RowActionStatus) => void;
  handleShowOverview: OnMapRowCellClick;
  uniqueCategoryNames: string[];
};

function Row(props: MapDetailsTableRowProps): JSX.Element {
  const {
    row,
    handleRowCheck,
    handleRowHover,
    handleShowOverview,
    isSelectedInMap,
    pingCount,
    isChecked,
    uniqueCategoryNames
  } = props;

  const onCheck = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    handleRowCheck({ critter_id: row.critter_id, active: val });
  };

  return (
    <TableRow
      hover={!isSelectedInMap}
      className={`map-bottom-panel-row ${isSelectedInMap ? 'row-selected' : ''}`}
      onMouseEnter={() => handleRowHover({ critter_id: row.critter_id, active: true })}
      onMouseLeave={() => handleRowHover({ critter_id: row.critter_id, active: false })}>
      <TableCell padding='checkbox'>
        <Checkbox color='primary' onChange={onCheck} checked={isChecked} />
      </TableCell>
      <TableCell>
        <Box
          className='colour-swatch'
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #999999',
            backgroundColor: parseAnimalColour(row.map_colour).fillColor
          }}></Box>
      </TableCell>
      <TableCell>{row.taxon}</TableCell>
      {uniqueCategoryNames.map((property) => {
        return <TableCell key={`cu_${property}`}>{row[property] ?? null}</TableCell>;
      })}
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
      <TableCell>{row.critter_status}</TableCell>
      <CellWithLink row={row} propName={'device_id'} onClickLink={(): void => handleShowOverview('device', row)} />
      <TableCell>{row.device_status}</TableCell>
      <TableCell>{row.paddedFrequency}</TableCell>
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
