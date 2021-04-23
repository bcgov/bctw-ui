import { ITelemetryDetail, ITelemetryCritterGroup, OnMapRowCellClick, TelemetryDetail } from 'types/map';
import { TableRow, TableCell, TableBody, Table, TableContainer, Paper, Checkbox } from '@material-ui/core';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';
import {
  flattenUniqueFeatureIDs,
  getFillColorByStatus,
  getLatestTelemetryFeature,
  MAP_COLOURS,
  sortGroupedFeatures
} from 'pages/map/map_helpers';
import { MapDetailsBaseProps } from './MapDetails';
import { dateObjectToDateStr } from 'utils/time';

export type MapDetailsGroupedProps = MapDetailsBaseProps & {
  features: ITelemetryCritterGroup[];
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
  'frequency',
  'capture_date',
  'Last Transmission Date',
  'Map Points'
];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { features, crittersSelected, handleShowOverview, handleRowSelected } = props;
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
    const newChecked = val ? features.map((f) => f.critter_id) : [];
    pushRowCheck(newChecked);
  };

  const handleRowCheck = (v: GroupedCheckedStatus): void => {
    // todo: cleanup
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
    const pointIDs = flattenUniqueFeatureIDs(features.filter((f) => ids.includes(f.critter_id)));
    handleRowSelected(pointIDs);
  };

  return (
    <TableContainer component={Paper} className={'bottom-tbl'}>
      <Table stickyHeader size='small'>
        {features && features.length ? (
          <TableHead
            headersToDisplay={rows_to_render}
            headerData={plainToClass(TelemetryDetail, features[0].features[0].properties) as TelemetryDetail}
            numSelected={checkedGroups.length}
            order={order}
            orderBy={orderBy ?? ''}
            onRequestSort={handleSort}
            rowCount={features.length}
            isMultiSelect={true}
            onSelectAllClick={handleSelectAllClick}
            customHeaders={[]}
          />
        ) : null}
        <TableBody>
          {sortGroupedFeatures(features, getComparator(order, orderBy)).map((u, idx) => {
            return (
              <Row
                key={u.critter_id}
                pointIDs={u.features.map((f) => f.id)}
                isChecked={checkedGroups.includes(u.critter_id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                row={getLatestTelemetryFeature(u.features)?.properties}
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
  pointIDs: number[];
  isSelectedInMap: boolean;
  isChecked: boolean;
  row: ITelemetryDetail;
  handleRowCheck: (v: GroupedCheckedStatus) => void;
  handleShowOverview: OnMapRowCellClick;
};

function Row(props: MapDetailsTableRowProps): JSX.Element {
  const { row, handleRowCheck, handleShowOverview, isSelectedInMap, pointIDs, isChecked } = props;

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
          backgroundColor: row.animal_colour
            ? getFillColorByStatus({ properties: row, id: null, type: 'Feature', geometry: null })
            : MAP_COLOURS['unassigned point']
        }}></TableCell>
      <CellWithLink row={row} propName={'wlh_id'} onClickLink={(): void => handleShowOverview('critter', row)} />
      <CellWithLink row={row} propName={'animal_id'} onClickLink={(): void => handleShowOverview('critter', row)} />
      <CellWithLink row={row} propName={'device_id'} onClickLink={(): void => handleShowOverview('collar', row)} />
      <TableCell>{row.frequency}</TableCell>
      <TableCell>{dateObjectToDateStr(row.capture_date)}</TableCell>
      <TableCell>{dateObjectToDateStr(row.date_recorded)}</TableCell>
      <TableCell>{pointIDs.length}</TableCell>
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
