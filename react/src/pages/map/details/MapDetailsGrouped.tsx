import { ITelemetryDetail, ITelemetryGroup, OnMapRowCellClick, TelemetryDetail } from 'types/map';
import { TableRow, TableCell, TableBody, Table, TableContainer, Paper, Checkbox } from '@material-ui/core';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';
import {
  getPointIDsFromTelemetryGroup,
  getFillColorByStatus,
  getLatestPing,
  MAP_COLOURS,
  sortGroupedTelemetry
} from 'pages/map/map_helpers';
import { MapDetailsBaseProps } from './MapDetails';
import { dateObjectToDateStr } from 'utils/time';
import useDidMountEffect from 'hooks/useDidMountEffect';

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
  'wlh_id',
  'animal_id',
  'device_id',
  'Frequency (MHz)',
  'capture_date',
  'Last Transmission',
  'Point Count'
];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { pings, crittersSelected, handleShowOverview, handleRowSelected } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('Critter Name');
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

  useDidMountEffect(() => {
    if (!crittersSelected.length) {
      setCheckedGroups([]);
    }
  }, [crittersSelected]);

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

  return (
    <TableContainer component={Paper} className={'bottom-tbl'}>
      <Table stickyHeader size='small'>
        {pings && pings.length ? (
          <TableHead
            headersToDisplay={rows_to_render}
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
                // todo: fixme: should it be the latest props that are displayed?
                row={getLatestPing(u.features)?.properties}
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
  row: ITelemetryDetail;
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
    <TableRow hover className={`map-bottom-panel-row ${isSelectedInMap ? 'bottom-panel-row-is-map-selected' : ''}`}>
      <TableCell padding='checkbox'>
        <Checkbox color='primary' onChange={onCheck} checked={isChecked} />
      </TableCell>
      {/* cast the detail to a feature in order to determine the swatch colour */}
      <TableCell
        style={{
          width: '5%',
          backgroundColor: row.animal_colour
            ? getFillColorByStatus({ properties: row, id: null, type: 'Feature', geometry: null })
            : MAP_COLOURS['unassigned point']
        }}></TableCell>
      {row.critter_id ? <CellWithLink row={row} propName={'wlh_id'} onClickLink={(): void => handleShowOverview('animal', row)} /> : <TableCell></TableCell>}
      {row.critter_id ? <CellWithLink row={row} propName={'animal_id'} onClickLink={(): void => handleShowOverview('animal', row)} /> : <TableCell></TableCell>}
      <CellWithLink row={row} propName={'device_id'} onClickLink={(): void => handleShowOverview('device', row)} />
      {/* todo: add frequency unit type */}
      <TableCell>{row.frequency}</TableCell>
      <TableCell>{row.capture_date ? dateObjectToDateStr(row.capture_date) : ''}</TableCell>
      <TableCell>{dateObjectToDateStr(row.date_recorded)}</TableCell>
      <TableCell>{pingCount}</TableCell>
    </TableRow>
  );
}

type TableCellLinkProps = {
  row: ITelemetryDetail;
  propName: string;
  onClickLink: () => void;
};
function CellWithLink({ row, propName, onClickLink }: TableCellLinkProps): JSX.Element {
  return (
    <TableCell className={row[propName] ? '' : 'map-details-cell-hover'} onClick={row[propName] ? null : onClickLink}>
      <div onClick={row[propName] ? onClickLink : null} className={'map-details-clickable-cell map-details-cell-hover'}>
        {row[propName] ?? ''}
      </div>
    </TableCell>
  );
}
