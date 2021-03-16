import { ITelemetryDetail, ITelemetryFeature, IUniqueFeature, OnPanelRowHover } from 'types/map';
import { useEffect, useState } from 'react';
import MapDetailsMultiple from 'pages/map/details/MapDetailsMultiple';
import { groupFeaturesByCritters } from '../map_helpers';
import { ICodeFilter } from 'types/code';

export type DetailsSortOption = 'animal_id' | 'device_id' | 'frequency';

type MapDetailsProps = {
  features: ITelemetryFeature[];
  // features IDs selected via the map interface
  selectedFeatureIDs: number[];
  handleSelectCritter: (v: ITelemetryDetail) => void;
  handleHoverCritter: OnPanelRowHover;
  // list of filters applied from map side panel
  filters: ICodeFilter[];
};

export default function MapDetails({
  features,
  filters,
  selectedFeatureIDs,
  handleSelectCritter,
  handleHoverCritter,
}: MapDetailsProps): JSX.Element {
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);
  const [crittersSelectedInMap, setCrittersSelectedInMap] = useState<string[]>([]);
  const [sort, setSort] = useState<DetailsSortOption>('animal_id');

  // upon initial load, display all groups in details pane
  useEffect(() => {
    const grouped = groupFeaturesByCritters(features, sort);
    setGroupedFeatures(grouped);
  }, [features]);

  // when user limits features selection via the map
  useEffect(() => {
    const update = (): void => {
      const critterIds = groupFeaturesByCritters(
        features.filter((f) => selectedFeatureIDs.includes(f.id)),
        sort
      ).map((g) => g.critter_id);
      // console.log('selected: ', critterIds);
      // todo: sort selected in map critters to the top?
      setCrittersSelectedInMap(critterIds);
    };
    update();
  }, [selectedFeatureIDs]);

  // upon on filters applied
  // fixme: applying multiple filters not working
  useEffect(() => {
    const update = (): void => {
      if (!filters.length) {
        setGroupedFeatures(groupFeaturesByCritters(features, sort));
        return;
      }
      let filteredFeatures = [];
      filters.forEach((c) => {
        const theseFeatures = features.filter((p) => {
          const { properties } = p;
          const { code_header, description } = c;
          // detail doesnt have this prop yet. ex juvenile
          if (!properties[code_header]) {
            // console.log(`detail is missing ${code_header}! ${description}`)
          }
          // console.log(`${properties[code_header]} : ${description} ${properties[code_header] === description}`)
          return properties[code_header] === description;
        });
        filteredFeatures = [...filteredFeatures, ...theseFeatures];
      });
      const grouped = groupFeaturesByCritters(filteredFeatures, sort);
      setGroupedFeatures(grouped);
    };
    update();
    // console.log('bottom panel filters changed ', filters);
    // setGroupedFeatures(groupFeaturesByCritters(features, sort));
  }, [filters]);

  return (
    <div className={''}>
      <div className={'map-bottom-panel-title'}>
        <h3>{filters.length ? 'Selected' : 'Default'} Animal Set</h3>
        <h3>Export</h3>
      </div>
      <MapDetailsMultiple
        crittersSelected={crittersSelectedInMap}
        features={groupedFeatures}
        handleCritterClick={handleSelectCritter}
        handleCritterHover={handleHoverCritter}
      />
    </div>
  );
}
