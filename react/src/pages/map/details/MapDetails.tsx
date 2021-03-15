import { ITelemetryDetail, ITelemetryFeature, IUniqueFeature } from 'types/map';
import { useEffect, useState } from 'react';
import MapDetailsMultiple from 'pages/map/details/MapDetailsMultiple';
// import MapDetailsIndividual from 'pages/map/details/MapDetailsIndividual';
// import Button from 'components/form/Button';
import { getGroupFeatureCount, groupFeaturesByCritters } from '../map_helpers';
// import MapDetailsPoints from './MapDetailsPoints';
import { Select, FormControl, MenuItem } from '@material-ui/core';
import { columnToHeader } from 'utils/common';

export type DetailsSortOption = 'animal_id' | 'device_id' | 'frequency';

enum eViewState {
  all = 'all',
  // points = 'points',
  single = 'single'
}
type MapDetailsProps = {
  features: ITelemetryFeature[];
  // features IDs selected via the map interface
  selectedFeatureIDs: number[];
  handleSelectCritter: (v: ITelemetryDetail) => void;
  // children: React.ReactChild;
};

export default function MapDetails({ features, selectedFeatureIDs, handleSelectCritter }: MapDetailsProps): JSX.Element {
  const [view, setView] = useState<eViewState>(eViewState.all);
  const [idxGroupSelected, setIdxGroupSelected] = useState<number>(null);
  const [idSingleSelected, setIdSingleSelected] = useState<number>(null);
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);
  const [numFeaturesExported, setNumFeaturesExported] = useState<number>(features.length);
  const [sort, setSort] = useState<DetailsSortOption>('animal_id');

  // upon load, display all groups in details pane
  useEffect(() => {
    const grouped = groupFeaturesByCritters(features, sort);
    setGroupedFeatures(grouped);
    setNumFeaturesExported(getGroupFeatureCount(grouped));
  }, [features]);

  // when user limits features selection via the map
  useEffect(() => {
    const update = (): void => {
      const grouped = groupFeaturesByCritters(
        selectedFeatureIDs.length ? features.filter((f) => selectedFeatureIDs.includes(f.id)) : features,
        sort
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

  useEffect(() => {
    // console.log('sort changed ', sort);
    setGroupedFeatures(groupFeaturesByCritters(features, sort));
  }, [sort]);

  // const handleBackClick = (): void => {
  //   switch (view) {
  //     case eViewState.points:
  //       setNumFeaturesExported(getGroupFeatureCount(groupedFeatures));
  //       setView(eViewState.all);
  //       return;
  //     case eViewState.single:
  //       setNumFeaturesExported(groupedFeatures[idxGroupSelected].count);
  //       setView(eViewState.points);
  //       return;
  //   }
  // };

  // const handleGroupClick = (critter_id: string): void => {
  //   const idx = groupedFeatures.findIndex((grp) => grp.critter_id === critter_id);
  //   setIdxGroupSelected(idx);
  //   setNumFeaturesExported(groupedFeatures[idx].count);
  //   setView(eViewState.points);
  // };

  // const handlePointClick = (f: ITelemetryFeature): void => {
  //   setIdSingleSelected(f.id);
  //   setNumFeaturesExported(1);
  //   setView(eViewState.single);
  // };

  // const handleSelectCritter = (row: ITelemetryDetail) => {
  //   console.log('row clicked: ', row);
  // };

  return (
    <>
      <div className={'side-panel-title'}>
        {view === eViewState.all ? <h3>Default Animal Set</h3> : null}
        <h3>Export</h3>
      </div>
      {/* <div className={'results-container'} id='collar-list'> */}
      {view === eViewState.all ? (
        <MapDetailsMultiple handleCritterClick={handleSelectCritter} features={groupedFeatures} />
      ) : null}
      {/* view === eViewState.points ? (
           <MapDetailsPoints features={groupedFeatures[idxGroupSelected]} onClickPoint={handlePointClick} />
         ) : view === eViewState.single ? (
           <MapDetailsIndividual feature={features.find((f) => f.id === idSingleSelected)} />
         ) : null} */}
      {/* </div> */}
    </>
  );
}

// type MapSortProps = {
//   onChange: (v: DetailsSortOption) => void;
// };
// const sortOptions = ['animal_id', 'device_id', 'frequency'];

// const MapDetailsSort = (props: MapSortProps): JSX.Element => {
//   const { onChange } = props;
//   const [option, setOption] = useState<DetailsSortOption>('animal_id');

//   const handleChange = (e: React.ChangeEvent<{ value: DetailsSortOption }>): void => {
//     const newVal = e.target.value;
//     setOption(newVal);
//     onChange(newVal);
//   };

//   return (
//     <FormControl className={'details-sort'}>
//       <Select value={option} onChange={handleChange}>
//         {sortOptions.map((o, idx) => {
//           return (
//             <MenuItem key={`${o}-${idx}`} value={o}>
//               {`Sort by ${columnToHeader(o)}`}
//             </MenuItem>
//           );
//         })}
//       </Select>
//     </FormControl>
//   );
// };
