import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryFeature, IUniqueFeature, OnCritterRowClick, OnPanelRowHover } from 'types/map';
import { filterFeatures, groupFeaturesByCritters, groupFilters } from '../map_helpers';

type MapDetailsProps = {
  features: ITelemetryFeature[];
  // features IDs selected via the map interface
  selectedFeatureIDs: number[];
  handleSelectCritter: OnCritterRowClick;
  handleHoverCritter: OnPanelRowHover;
  // list of filters applied from map side panel
  filters: ICodeFilter[];
};

export default function MapDetails({
  features,
  filters,
  selectedFeatureIDs,
  handleSelectCritter,
  handleHoverCritter
}: MapDetailsProps): JSX.Element {
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);
  const [crittersSelectedInMap, setCrittersSelectedInMap] = useState<string[]>([]);
  const [sort] = useState<DetailsSortOption>('animal_id');

  // upon initial load, display all critters in bottom panel
  useEffect(() => {
    const grouped = groupFeaturesByCritters(features, sort);
    setGroupedFeatures(grouped);
  }, [features]);

  // when user limits features selection via the map
  // highlight them in child details component
  useEffect(() => {
    const update = (): void => {
      const critterIds = groupFeaturesByCritters(
        features.filter((f) => selectedFeatureIDs.includes(f.id)),
        sort
      ).map((g) => g.critter_id);
      // todo: sort selected in map critters to the top?
      setCrittersSelectedInMap(critterIds);
    };
    update();
  }, [selectedFeatureIDs]);

  // upon on filters applied
  useEffect(() => {
    const update = (): void => {
      if (!filters.length) {
        // reset
        setGroupedFeatures(groupFeaturesByCritters(features, sort));
        return;
      }
      setGroupedFeatures(groupFeaturesByCritters(filterFeatures(groupFilters(filters), features), sort));
    };
    update();
  }, [filters]);

  return (
    <>
      <div className={'map-bottom-panel-title'}>
        <h3>{filters.length ? 'Selected' : 'Default'} Animal Set</h3>
        <h3>Export</h3>
      </div>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        features={groupedFeatures}
        handleCritterClick={handleSelectCritter}
        handleCritterHover={handleHoverCritter}
      />
    </>
  );
}
