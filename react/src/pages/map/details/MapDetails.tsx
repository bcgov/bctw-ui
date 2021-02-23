import { ITelemetryFeature } from 'types/map';
import TabDetailsMultiple from 'pages/map/details/MapDetailsMultiple';
import MapDetailsIndividual from 'pages/map/details/MapDetailsIndividual';

type MapDetailsProps = {
  selected: ITelemetryFeature[];
};
export default function MapDetails({ selected }: MapDetailsProps): JSX.Element {
  return (
    <div className={'side-panel'}>
      <h1 className={'side-panel-title'}>Selected Telemetry</h1>
      <div className={'results-container'} id='collar-list'>
        <div className={'results-title'}>
          Points Selected - <span>({selected.length})</span>
        </div>
        {selected.length <= 1 ? (
          <MapDetailsIndividual feature={selected[0]} />
        ) : (
          <TabDetailsMultiple
            features={selected}
          />
        )}
      </div>
    </div>
  );
}
