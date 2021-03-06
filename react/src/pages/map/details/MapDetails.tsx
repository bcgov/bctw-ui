import { ITelemetryFeature, TelemetryDetail, TelemetryFeature } from 'types/map';
import { useEffect, useState } from 'react';
import MapDetailsMultiple from 'pages/map/details/MapDetailsMultiple';
import MapDetailsIndividual from 'pages/map/details/MapDetailsIndividual';
import Button from 'components/form/Button';
import { groupFeaturesByCritters, IUniqueFeature } from '../map_helpers';
import { Table, TableBody, TableCell, TableRow, TableHead } from '@material-ui/core';
import { plainToClass } from 'class-transformer';
import { formatTableCell } from 'components/table/table_helpers';

enum eViewState {
  all = 'all',
  points = 'points',
  single = 'single'
}
type MapDetailsProps = {
  features: ITelemetryFeature[];
  selectedFeatureIDs: number[];
};

export default function MapDetails({ features, selectedFeatureIDs }: MapDetailsProps): JSX.Element {
  const [view, setView] = useState<eViewState>(eViewState.all);
  const [idxGroupSelected, setIdxGroupSelected] = useState<number>(null);
  const [idxSingleSelected, setIdxSingleSelected] = useState<number>(null);
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);

  useEffect(() => {
    setGroupedFeatures(groupFeaturesByCritters(features));
  },[features] );

  useEffect(() => {
    const update = (): void => {
      const grped = groupFeaturesByCritters(selectedFeatureIDs.length ? features.filter(f => selectedFeatureIDs.includes(f.id as number)) : features);
      setGroupedFeatures(grped);

      if (selectedFeatureIDs.length === 1) {
        setView(eViewState.single);
      } else {
        setView(eViewState.all);
      }
    };
    update();
  }, [selectedFeatureIDs]);

  const handleBackClick = (): void => {
    switch (view) {
      case eViewState.all:
        return;
      case eViewState.points:
        setView(eViewState.all);
        return;
      case eViewState.single:
        setView(eViewState.points);
        return;
    }
  };

  const handleGroupClick = (critter_id: string): void => {
    const idx = groupedFeatures.findIndex((grp) => grp.critter_id === critter_id);
    setIdxGroupSelected(idx);
    setView(eViewState.points);
  };

  const handlePointClick = (f: ITelemetryFeature): void => {
    const grp = groupedFeatures[idxGroupSelected];
    const idx = grp.features.findIndex(d => d.id === f.id);
    setIdxSingleSelected(idx);
    setView(eViewState.single);
  };

  return (
    <div className={'side-panel'}>
      <div className={'side-panel-export'}>
        {view !== eViewState.all ? <Button onClick={handleBackClick}>back</Button> : <p></p>}
        <p>Export ({selectedFeatureIDs.length})</p>
      </div>
      {view === eViewState.all ? <h1 className={'side-panel-title'}>All Animals</h1> : null}
      <div className={'results-container'} id='collar-list'>
        {view === eViewState.all ? (
          <MapDetailsMultiple handleCritterClick={handleGroupClick} features={groupedFeatures} />
        ) : view === eViewState.single ? (
          <MapDetailsIndividual feature={groupedFeatures[idxGroupSelected].features[idxSingleSelected]} />
        ) : view === eViewState.points ? (
          <MapDetailsPoints features={groupedFeatures[idxGroupSelected]} onClickPoint={handlePointClick}/>
        ) : null}
      </div>
    </div>
  );
}

type MapDetailsPointsProps = {
  features: IUniqueFeature;
  onClickPoint: (f: ITelemetryFeature) => void;
};

const MapDetailsPoints = (props: MapDetailsPointsProps): JSX.Element => {
  const { features, onClickPoint } = props;
  const fList = features.features;
  if (!fList.length) {
    return null;
  }
  // console.log(`numpoints `,fList.length)
  const first = fList[0];
  const firstDetail = first.properties;
  return (
    <>
      <p>Animal ID: {firstDetail.animal_id}</p>
      <p>Device ID: {firstDetail.device_id}</p>
      <p>Results ({fList.length})</p>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Timestamp</strong>
            </TableCell>
            <TableCell align='right'>
              <strong>Location</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fList.map((f: ITelemetryFeature) => {
            const featureInstance = plainToClass(TelemetryFeature, f);
            const detailInstance = plainToClass(TelemetryDetail, f.properties);
            return (
              <TableRow key={f.id} hover onClick={(): void => onClickPoint(f)}>
                <TableCell>{formatTableCell(detailInstance, 'date_recorded')?.value}</TableCell>
                <TableCell align='right'>{featureInstance.location}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
