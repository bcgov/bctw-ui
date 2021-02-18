import { Tabs, Tab } from '@material-ui/core';
import { useState } from 'react';
import { ITelemetryFeature } from 'types/map';
import TabDetailsIndividual from 'pages/map/details/TabDetailsIndividual';
import TabDetailsMultiple from 'pages/map/details/TabDetailsMultiple';

type MapDetailsProps = {
  selected: ITelemetryFeature[];
};
export default function MapDetails({ selected }: MapDetailsProps): JSX.Element {
  // console.log(JSON.stringify(selected));
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleSelectTab = (event: React.ChangeEvent<{ unknown }>, newValue: number): void => {
    setTabIndex(newValue);
  };

  const critterProps = ['species', 'animal_id', 'animal_status', 'calf_at_heel', 'population_unit', 'live_stage'];
  const collarProps = ['device_vendor', 'radio_frequency', 'satellite_network', 'date_recorded'];

  return (
    <div className={'side-panel'}>
      <h1 className={'side-panel-title'}>Selected Telemetry</h1>
      <div className={'results-container'} id='collar-list'>
        <Tabs className='tab-header' value={false} onChange={handleSelectTab}>
          <Tab disabled={!selected.length} label='Animal' />
          <Tab disabled={!selected.length} label='Collar' />
        </Tabs>
        <div className={'results-title'}>
          Points Selected - <span>({selected.length})</span>
        </div>
        {selected.length <= 1 ? (
          <>
            <TabDetailsIndividual value={tabIndex} index={0} feature={selected[0]} display={critterProps} />
            <TabDetailsIndividual value={tabIndex} index={1} feature={selected[0]} display={collarProps} />
          </>
        ) : (
          <>
            <TabDetailsMultiple
              displayType='critter_id'
              value={tabIndex}
              index={0}
              features={selected}
              display={critterProps}
            />
            <TabDetailsMultiple
              displayType='collar_id'
              value={tabIndex}
              index={1}
              features={selected}
              display={collarProps}
            />
          </>
        )}
      </div>
    </div>
  );
}
