import MapDetailsGrouped from 'pages/map/details/MapDetailsGrouped';
import { useEffect, useState } from 'react';
import { ICodeFilter } from 'types/code';
import { DetailsSortOption, ITelemetryFeature, IUniqueFeature, OnPanelRowSelect, OnMapRowCellClick, OnlySelectedCritters } from 'types/map';
import Checkbox from 'components/form/Checkbox';
import { applyFilter, flattenUniqueFeatureIDs, getUniqueCritterIDsFromFeatures, groupFeaturesByCritters, groupFilters } from '../map_helpers';
import MapExport from 'pages/map/MapExport';
import { Button } from '@material-ui/core';
import { MapStrings } from 'constants/strings';
import useDidMountEffect from 'hooks/useDidMountEffect';

export type MapDetailsBaseProps = {
  handleRowSelected: OnPanelRowSelect;
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
  handleShowOnlySelected: (o: OnlySelectedCritters) => void;
};

export default function MapDetails({
  features,
  filters,
  selectedFeatureIDs,
  handleShowOverview,
  handleShowOnlySelected,
  handleRowSelected,
  showExportModal,
  setShowExportModal
}: MapDetailsProps): JSX.Element {
  const [groupedFeatures, setGroupedFeatures] = useState<IUniqueFeature[]>([]);
  const [crittersSelectedInMap, setCrittersSelectedInMap] = useState<string[]>([]);
  // for export state
  const [groupedFeaturesChecked, setGroupedFeaturesChecked] = useState<IUniqueFeature[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [sort] = useState<DetailsSortOption>('wlh_id');

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
      setGroupedFeatures(groupFeaturesByCritters(applyFilter(groupFilters(filters), features), sort));
    };
    update();
  }, [filters]);

  // when the 'show only selected' checkbox is changed, update parent map state
  useDidMountEffect(() => {
    if (features) {
      handleRowsChecked(flattenUniqueFeatureIDs(groupedFeaturesChecked))
    }
  }, [showOnlySelected])

  // upon rows checked in each row
  const handleRowsChecked = (ids: number[]): void => {
    const grouped = groupFeaturesByCritters(features.filter((f) => ids.includes(f.id)));
    setGroupedFeaturesChecked(grouped);
    handleRowSelected(ids);
    if (showOnlySelected) {
      handleShowOnlySelected({show: true, critter_ids: grouped.map(g => g.critter_id)});
    }
  };

  const handleShowSelectedChecked = (val: Record<string, boolean>): void => {
    const isChecked = val[MapStrings.onlySelectedLabel];
    setShowOnlySelected(isChecked);
    // call the parent handler
    handleShowOnlySelected({show: isChecked, critter_ids: groupedFeaturesChecked.map(g => g.critter_id)});
  }

  return (
    <>
      <div className={'map-bottom-panel-title'}>
        <h3>{filters.length ? 'Selected' : 'Default'} Animal Set</h3>
        <div>
          <Checkbox
            label={MapStrings.onlySelectedLabel}
            initialValue={false}
            changeHandler={handleShowSelectedChecked}
          />
          <Button color='primary' onClick={(): void => setShowExportModal(true)} variant='outlined'>Export</Button>
        </div>
      </div>
      <MapDetailsGrouped
        crittersSelected={crittersSelectedInMap}
        features={groupedFeatures}
        handleShowOverview={handleShowOverview}
        handleRowSelected={handleRowsChecked}
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
