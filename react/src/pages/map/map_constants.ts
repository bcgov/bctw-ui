import { MapStrings } from 'constants/strings';

const DEVICE_STATUS_OPTIONS = [
  { id: 1, value: MapStrings.assignmentStatusOptionA, default: true },
  { id: 2, value: MapStrings.assignmentStatusOptionU }
];

const CODE_FILTERS: { header: string; label?: string }[] = [
  { header: 'species' },
  { header: 'animal_status' },
  { header: 'device_status' },
  { header: 'sex' }
];

export { CODE_FILTERS ,DEVICE_STATUS_OPTIONS };
