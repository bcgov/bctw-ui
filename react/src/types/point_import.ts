import { ITelemetryDetail } from 'types/map';

/**
 * types used to bulk import historical telemetry
 */

// what the API endpoint expects a historical telemetry point object to look like
export type IHistoricalTelemetryInput = Pick<ITelemetryDetail, 'device_id' | 'date_recorded' | 'device_vendor'> & {
  latitude: number;
  longitude: number;
};
