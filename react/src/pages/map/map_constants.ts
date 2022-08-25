import { MapStrings } from 'constants/strings';
import { TelemetryDetail } from 'types/map';

// device status options displayed in map filters panel
const DEVICE_STATUS_OPTIONS = [
  { id: 1, value: MapStrings.assignmentStatusOptionA, default: true },
  { id: 2, value: MapStrings.assignmentStatusOptionU }
];

// dropdown filters displayed in map filters panel
const CODE_FILTERS: { header: keyof TelemetryDetail; label?: string; filter?: string[] }[] = [
  { header: 'device_id', label: 'Device ID (Default)' },
  { header: 'species' },
  { header: 'animal_status' },
  { header: 'device_status' },
  { header: 'sex' },
  { header: 'population_unit', filter: [] },
  { header: 'collective_unit' }
];

export { CODE_FILTERS, DEVICE_STATUS_OPTIONS };
