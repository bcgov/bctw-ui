import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryFeature, IUniqueFeature, OnPanelRowHover, OnMapRowCellClick } from 'types/map';
import { filterFeatures, getUniqueCritterIDsFromFeatures, groupFeaturesByCritters, groupFilters } from '../map_helpers';
import MapExport from 'pages/map/MapExport';
import { Button } from '@material-ui/core';

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
  const [groupedFeaturesChecked, setGroupedFeaturesChecked] = useState<IUniqueFeature[]>([]);
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
      const critterIds = getUniqueCritterIDsFromFeatures(features, selectedFeatureIDs);
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

  // upon rows checked in each row
  const onRowsChecked = (ids: number[]): void => {
    const grouped = groupFeaturesByCritters(features.filter((f) => ids.includes(f.id)));
    setGroupedFeaturesChecked(grouped);
    handleHoverCritter(ids);
  };

  return (
    <>
      <div className={'map-bottom-panel-title'}>
        <h3>{filters.length ? 'Selected' : 'Default'} Animal Set</h3>
        <Button color='primary' onClick={(): void => setShowExportModal(true)} variant='outlined'>Export</Button>
      </div>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        features={groupedFeatures}
        handleShowOverview={handleShowOverview}
        handleHoverCritter={onRowsChecked}
      />
      <MapExport
        critter_ids={
          groupedFeaturesChecked.length
            ? groupedFeaturesChecked.map((g) => g.critter_id)
            : groupedFeatures.map((f) => f.critter_id)
        }
        collar_ids={
          groupedFeaturesChecked.length
            ? groupedFeaturesChecked.map((f) => f.features[0].properties.collar_id)
            : groupedFeatures.map((f) => f.features[0].properties.collar_id)
        }
        open={showExportModal}
        handleClose={(): void => setShowExportModal(false)}
      />
    </>
  );
}
