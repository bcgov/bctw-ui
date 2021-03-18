import { ITelemetryDetail, IUniqueFeature, OnCritterRowClick, OnPanelRowHover, TelemetryDetail } from 'types/map';
import { Checkbox, TableRow, TableCell, TableBody, Table, TableContainer, Paper } from '@material-ui/core';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';
import { flattenUniqueFeatureIDs, sortGroupedFeatures } from 'pages/map/map_helpers';

export type MapDetailsGroupedProps = {
  handleCritterHover: OnPanelRowHover;
  handleCritterClick: OnCritterRowClick;
  features: IUniqueFeature[];
  crittersSelected: string[];
};

type GroupedCheckedStatus = {
  critter_id: string,
  animal_id: string,
  checked: boolean
}

const rows_to_render = ['animal_id', 'wlh_id', 'device_id', 'frequency', 'Map Points'];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { features, crittersSelected, handleCritterClick, handleCritterHover } = props;
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
    const newChecked =val ? features.map(f => f.critter_id) : [];
    pushRowCheck(newChecked);
  }

  const handleRowCheck = (v: GroupedCheckedStatus): void => {
    // todo: cleanup
    let newChecked = null;
    const idxFound = checkedGroups.indexOf(v.critter_id);
    if (idxFound === -1) {
      newChecked = [ ...checkedGroups, v.critter_id ];
    } else {
      const cp = [...checkedGroups];
      cp.splice(idxFound, idxFound + 1);
      if (v.checked) {
        cp.push(v.critter_id);
      }
      newChecked = cp;
    }
    pushRowCheck(newChecked);
  }

  const pushRowCheck = (ids: string[]): void => {
    setCheckedGroups(ids);
    const pointIDs = flattenUniqueFeatureIDs(features.filter(f => ids.includes(f.critter_id)));
    handleCritterHover(pointIDs);
  }

  return (
    <TableContainer component={Paper}>
      <Table>
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
          {sortGroupedFeatures(features, getComparator(order, orderBy)).map((u) => {
            return (
              <Row
                key={u.critter_id}
                pointIDs={u.features.map((f) => f.id)}
                isChecked={checkedGroups.includes(u.critter_id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                row={u.features[0].properties}
                handleCritterClick={handleCritterClick}
                handleRowCheck={handleRowCheck}
                handleCritterHover={handleCritterHover}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type IRowProps = {
  pointIDs: number[];
  isSelectedInMap: boolean;
  isChecked: boolean;
  row: ITelemetryDetail;
  handleCritterClick: OnCritterRowClick;
  handleCritterHover: OnPanelRowHover;
  handleRowCheck: (v: GroupedCheckedStatus) => void;
};
function Row(props: IRowProps): JSX.Element {
  const { row, handleRowCheck, handleCritterClick, isSelectedInMap, pointIDs, isChecked, handleCritterHover } = props;

  const onCheck = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    handleRowCheck({critter_id: row.critter_id, checked: val, animal_id: row.animal_id});
  };

  return (
    <TableRow
      hover
      className={`map-bottom-panel-row ${isSelectedInMap ? 'bottom-panel-row-is-map-selected' : ''}`}
      // fixme: weird competing interactions with hover/ check
      // onMouseEnter={(): void => handleCritterHover(pointIDs)}
      // onMouseLeave={(): void => handleCritterHover([])}
    >
      <TableCell padding='checkbox'>
        <Checkbox onChange={onCheck} checked={isSelectedInMap || isChecked} />
      </TableCell>
      <TableCell className={'critter-select'} onClick={(): void => handleCritterClick(row)}>
        {row.animal_id ?? 'unknown'}
      </TableCell>
      {rows_to_render.slice(1, 4).map((s, idx) => (
        <TableCell key={`${idx}-${s}`}>{row[s]}</TableCell>
      ))}
      <TableCell>{pointIDs.length}</TableCell>
    </TableRow>
  );
}
