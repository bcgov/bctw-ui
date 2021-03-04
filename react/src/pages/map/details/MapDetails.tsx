import { ITelemetryFeature, TelemetryDetail, TelemetryFeature } from 'types/map';
import { useEffect, useState } from 'react';
import MapDetailsMultiple, { MapMultipleSelected } from 'pages/map/details/MapDetailsMultiple';
import MapDetailsIndividual from 'pages/map/details/MapDetailsIndividual';
import Button from 'components/form/Button';
import { groupFeaturesByCritters, IUniqueFeature } from '../map_helpers';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import { plainToClass } from 'class-transformer';
import { formatTableCell } from 'components/table/table_helpers';

// todo: on clear selected points, restore all

enum eViewState {
  all = 'all',
  points = 'points',
  single = 'single'
}
type MapDetailsProps = {
  selected: ITelemetryFeature[];
};
export default function MapDetails({ selected }: MapDetailsProps): JSX.Element {
  const [view, setView] = useState<eViewState>(eViewState.all);
  const [previousView, setPreviousView] = useState<eViewState>(null);

  useEffect(() => {
    const update = (): void => {
      if (selected.length === 1) {
        setView(eViewState.single);
      } else {
        setView(eViewState.all);
      }
    };
    update();
  }, [selected]);

  const handleBackClick = (): void => {
    setView(previousView);
  };

  const changeView = (): void => {
    setPreviousView(view);
    setView(eViewState.points);
  };

  const grouped: IUniqueFeature[] = groupFeaturesByCritters(selected);

  return (
    <div className={'side-panel'}>
      <div className={'side-panel-export'}>
        {view !== eViewState.all ? <Button onClick={handleBackClick}>back</Button> : <p></p>}
        <p>Export ({selected.length})</p>
      </div>
      { view === eViewState.all ? <h1 className={'side-panel-title'}>Critters</h1> : null }
      <div className={'results-container'} id='collar-list'>
        {view === eViewState.all ? (
          <MapDetailsMultiple handleCritterClick={changeView} features={grouped} />
        ) : view === eViewState.single ? (
          <MapDetailsIndividual feature={selected[0]} />
        ) : view === eViewState.points ? (
          <MapDetailsPoints features={grouped} handleCritterClick={changeView}/>
        ) : null}
      </div>
    </div>
  );
}

const MapDetailsPoints = (props: MapMultipleSelected): JSX.Element => {
  const { features } = props;
  if (!features.length) {
    return null;
  }
  const first = features[0];
  const firstFeatures = first.features;
  const firstDetail = firstFeatures[0].properties;
  return (
    <>
      <h3>{firstDetail.animal_id}</h3>
      <h4>Device ID {firstDetail.device_id}</h4>
      <p>Results ({first.features.length})</p>
      <Table>
        <TableBody>
          {
            firstFeatures.map((f: ITelemetryFeature) => {
              const featureInstance = plainToClass(TelemetryFeature, f);
              const detailInstance = plainToClass(TelemetryDetail, f.properties);
              return (
                <TableRow>
                  <TableCell><b>{formatTableCell(detailInstance, 'date_recorded')?.value}</b></TableCell>
                  <TableCell align='right'>{featureInstance.location}</TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </>
  )
};
