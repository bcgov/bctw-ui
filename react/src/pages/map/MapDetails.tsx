import { TableRow, TableHead, TableCell, TableBody, Table, Tabs, Tab, Box, Typography, Divider } from '@material-ui/core';
import { formatTableCell } from 'components/table/table_helpers';
import { useState } from 'react';
import { ITelemetryFeature } from 'types/map';
import { columnToHeader } from 'utils/common';
import './MapPage.scss';

type MapDetailsProps = {
  selected: ITelemetryFeature[];
};
export default function MapDetails({ selected }: MapDetailsProps): JSX.Element {
  // console.log(JSON.stringify(selected));
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleSelectTab = (event: React.ChangeEvent<{ unknown }>, newValue: number): void => {
    setTabIndex(newValue);
  };

  const critterProps = ['species', 'animal_id', 'live_stage', 'calf_at_heel', 'animal_status', 'population_unit'];
  const collarProps = ['date_recorded', 'device_vendor', 'radio_frequency', 'satellite_network'];

  return (
    <div className={'side-panel'}>
      <h1 className={'side-panel-title'}>Selected Telemetry</h1>
      <div className={'results-container'} id='collar-list'>
        <div className={'results-title'}>
          Results <span>({selected.length})</span>
          {selected.length ? <ShowGeometry point={selected[0].geometry as GeoJSON.Point} /> : null}
        </div>
        <Tabs className='tab-header' value={false} onChange={handleSelectTab}>
          <Tab label='Animal' />
          <Tab label='Collar' />
        </Tabs>
        <TabPanel value={tabIndex} index={0} feature={selected[0]} display={critterProps} />
        <TabPanel value={tabIndex} index={1} feature={selected[0]} display={collarProps} />
      </div>
    </div>
  );
}

type ShowGeometryProps = {
  point: GeoJSON.Point;
}
function ShowGeometry({point}: ShowGeometryProps): JSX.Element {
  const {coordinates} = point;
  return (
    <div>
      <div>Point Data</div>
      <div>Latitude: {coordinates[1]}</div>
      <div>Longitude: {coordinates[0]}</div>
    </div>
  );
}

type TabPanelProps = {
  feature: ITelemetryFeature;
  index: number;
  value: number;
  display: string[];
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { feature, value, index, display } = props;

  if (!feature) {
    return null;
  }
  const { properties, id } = feature;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box p={3}>
          <Table>
            <TableHead></TableHead>
            <TableBody>
              {Object.keys(properties)
                .filter((a) => display.includes(a))
                .map((k) => {
                  const { value } = formatTableCell(properties, k);
                  if (!value) {
                    return null;
                  }
                  return (
                    <TableRow key={`${id}_${k}`}>
                      <TableCell>{columnToHeader(k)}</TableCell>
                      <TableCell align='right'>{value}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Box>
      )}
    </div>
  );
}
