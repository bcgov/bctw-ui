import { MapStrings } from 'constants/strings';
import { TelemetryDetail } from 'types/map';
import { StartDateKey } from 'utils/time';

export type MapWeekMonthPresets = {
  label: string;
  key: StartDateKey;
};
type SearchPresets = {
  weeks: MapWeekMonthPresets[];
  months: MapWeekMonthPresets[];
};
// device status options displayed in map filters panel
const DEVICE_STATUS_OPTIONS = [
  { id: 1, value: MapStrings.assignmentStatusOptionA, default: true },
  { id: 2, value: MapStrings.assignmentStatusOptionU }
];

// dropdown filters displayed in map filters panel
const CODE_FILTERS: { header: keyof TelemetryDetail; label?: string; filter?: string[] }[] = [
  { header: 'device_id', label: 'Device ID (Default)' },
  { header: 'taxon' },
  { header: 'critter_status' },
  { header: 'device_status' },
  { header: 'sex' },
  { header: 'population_unit', filter: [] },
  { header: 'collective_unit' }
];

const SEARCH_PRESETS: SearchPresets = {
  weeks: [
    { label: 'Last Week', key: '1W' },
    { label: 'Last 2 Weeks', key: '2W' }
  ],
  months: [
    { label: 'Last Month', key: '1M' },
    { label: 'Last 3 Months', key: '3M' },
    { label: 'Last 6 Months', key: '6M' }
  ]
};

export { CODE_FILTERS, DEVICE_STATUS_OPTIONS, SEARCH_PRESETS };
