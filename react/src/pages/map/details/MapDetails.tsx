import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryFeature, IUniqueFeature, OnPanelRowHover, OnMapRowCellClick } from 'types/map';
import { filterFeatures, groupFeaturesByCritters, groupFilters } from '../map_helpers';
import MapExport from 'pages/map/MapExport';

export type MapDetailsBaseProps = {
  handleHoverCritter: OnPanelRowHover;
  handleShowOverview: OnMapRowCellClick;
};

type MapDetailsProps = MapDetailsBaseProps & {
  features: ITelemetryFeature[];
  // features IDs selected via the map interface
  selectedFeatureIDs: number[];
  // list of filters applied from map side panel
  filters: ICodeFilter[];
  showExportModal: boolean;
  setShowExportModal: (b: boolean) => void;
};

export default function MapDetails({
  features,
  filters,
  selectedFeatureIDs,
  handleShowOverview,
  handleHoverCritter,
  showExportModal,
  setShowExportModal
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
        <h3 onClick={(): void => setShowExportModal(true)} className={'critter-select'}>
          Export
        </h3>
      </div>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        features={groupedFeatures}
        handleShowOverview={handleShowOverview}
        handleHoverCritter={handleHoverCritter}
      />
      <MapExport
        critter_ids={groupedFeatures.map((f) => f.critter_id)}
        collar_ids={groupedFeatures.map(f => f.features[0].properties.collar_id)}
        open={showExportModal}
        handleClose={(): void => setShowExportModal(false)}
      />
    </>
  );
}
