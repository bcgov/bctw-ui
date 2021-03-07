import { ITelemetryFeature, IUniqueFeature } from 'types/map';
import { useEffect, useState } from 'react';
import MapDetailsMultiple from 'pages/map/details/MapDetailsMultiple';
import MapDetailsIndividual from 'pages/map/details/MapDetailsIndividual';
import Button from 'components/form/Button';
import { getGroupFeatureCount, groupFeaturesByCritters } from '../map_helpers';
import MapDetailsPoints from './MapDetailsPoints';

enum eViewState {
  all = 'all',
  points = 'points',
  single = 'single'
}
type MapDetailsProps = {
  features: ITelemetryFeature[];
  // features IDs selected via the map interface
  selectedFeatureIDs: number[];
};

export default function MapDetails({ features, selectedFeatureIDs }: MapDetailsProps): JSX.Element {
  const [view, setView] = useState<eViewState>(eViewState.all);
  const [idxGroupSelected, setIdxGroupSelected] = useState<number>(null);
  const [idSingleSelected, setIdSingleSelected] = useState<number>(null);
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);
  const [numFeaturesExported, setNumFeaturesExported] = useState<number>(features.length);

  // upon load, display all groups in details pane
  useEffect(() => {
    const grouped = groupFeaturesByCritters(features);
    setGroupedFeatures(grouped);
    setNumFeaturesExported(getGroupFeatureCount(grouped));
  }, [features]);

  // when user limits features selection via the map
  useEffect(() => {
    const update = (): void => {
      const grouped = groupFeaturesByCritters(
        selectedFeatureIDs.length ? features.filter((f) => selectedFeatureIDs.includes(f.id)) : features
      );
      setGroupedFeatures(grouped);
      setNumFeaturesExported(getGroupFeatureCount(grouped));

      if (selectedFeatureIDs.length === 1) {
        // find which group the individual id belongs to.
        const cid = features.find((f) => f.id === selectedFeatureIDs[0]).properties.critter_id;
        setIdxGroupSelected(grouped.findIndex((g) => g.critter_id === cid));
        setIdSingleSelected(selectedFeatureIDs[0]);
        setView(eViewState.single);
      } else {
        setView(eViewState.all);
      }
    };
    update();
  }, [selectedFeatureIDs]);

  const handleBackClick = (): void => {
    switch (view) {
      case eViewState.points:
        setNumFeaturesExported(getGroupFeatureCount(groupedFeatures));
        setView(eViewState.all);
        return;
      case eViewState.single:
        setNumFeaturesExported(groupedFeatures[idxGroupSelected].count);
        setView(eViewState.points);
        return;
    }
  };

  const handleGroupClick = (critter_id: string): void => {
    const idx = groupedFeatures.findIndex((grp) => grp.critter_id === critter_id);
    setIdxGroupSelected(idx);
    setNumFeaturesExported(groupedFeatures[idx].count);
    setView(eViewState.points);
  };

  const handlePointClick = (f: ITelemetryFeature): void => {
    setIdSingleSelected(f.id);
    setNumFeaturesExported(1);
    setView(eViewState.single);
  };

  return (
    <div className={'side-panel'}>
      <div className={'side-panel-export'}>
        {view !== eViewState.all ? <Button onClick={handleBackClick}>back</Button> : <p></p>}
        <p>Export ({numFeaturesExported})</p>
      </div>
      {view === eViewState.all ? <h1 className={'side-panel-title'}>All Animals</h1> : null}
      <div className={'results-container'} id='collar-list'>
        {view === eViewState.all ? (
          <MapDetailsMultiple handleCritterClick={handleGroupClick} features={groupedFeatures} />
        ) : view === eViewState.points ? (
          <MapDetailsPoints features={groupedFeatures[idxGroupSelected]} onClickPoint={handlePointClick} />
        ) : view === eViewState.single ? (
          <MapDetailsIndividual feature={features.find((f) => f.id === idSingleSelected)} />
        ) : null}
      </div>
    </div>
  );
}

