import { ITelemetryDetail, IUniqueFeature, OnCritterRowClick, OnPanelRowHover, TelemetryDetail } from 'types/map';
import { TableRow, TableCell, TableBody, Table, TableContainer, Paper } from '@material-ui/core';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';

export type MapDetailsGroupedProps = {
  handleCritterHover: OnPanelRowHover;
  handleCritterClick: OnCritterRowClick;
  features: IUniqueFeature[];
  crittersSelected: string[];
};

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { features, crittersSelected, handleCritterClick, handleCritterHover } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<any>('Critter Name');

  const handleSort = (event: React.MouseEvent<unknown>, property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function sortFeature(array: IUniqueFeature[], comparator: (a, b) => number): IUniqueFeature[] {
    const stabilizedThis = array.map((el, idx) => [el.features[0].properties, idx] as [ITelemetryDetail, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    const critterIds = stabilizedThis.map((a) => a[0].critter_id);
    const ret = [];
    for (let i = 0; i < critterIds.length; i++) {
      const foundIndex = array.findIndex((a) => a.critter_id === critterIds[i]);
      ret.push(array[foundIndex]);
    }
    return ret;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        {features && features.length ? (
          <TableHead
            headersToDisplay={['animal_id', 'wlh_id', 'device_id', 'frequency', 'Map Points']}
            headerData={plainToClass(TelemetryDetail, features[0].features[0].properties) as TelemetryDetail}
            numSelected={0}
            order={order}
            orderBy={orderBy ?? ''}
            onRequestSort={handleSort}
            rowCount={features.length}
            isMultiSelect={false}
            onSelectAllClick={null}
            customHeaders={[]}
          />
        ) : null}
        <TableBody>
          {sortFeature(features, getComparator(order, orderBy)).map((u) => {
            return (
              <Row
                key={u.critter_id}
                pointIDs={u.features.map((f) => f.id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                row={u.features[0].properties}
                handleCritterClick={handleCritterClick}
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
  row: ITelemetryDetail;
  handleCritterClick: OnCritterRowClick;
  handleCritterHover: OnPanelRowHover;
};
function Row(props: IRowProps): JSX.Element {
  const { row, handleCritterClick, isSelectedInMap, pointIDs, handleCritterHover } = props;
  return (
    <TableRow
      hover
      className={`map-bottom-panel-row ${isSelectedInMap ? 'bottom-panel-row-is-map-selected' : ''}`}
      onMouseEnter={(): void => handleCritterHover(pointIDs)}
      onMouseLeave={(): void => handleCritterHover([])}>
      <TableCell className={'critter-select'} onClick={(): void => handleCritterClick(row)}>
        {row.animal_id ?? 'unknown'}
      </TableCell>
      <TableCell>{row.wlh_id}</TableCell>
      <TableCell>{row.device_id}</TableCell>
      <TableCell>{row.frequency}</TableCell>
      <TableCell>{pointIDs.length}</TableCell>
    </TableRow>
  );
}
