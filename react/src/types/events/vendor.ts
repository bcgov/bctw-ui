/**
 * types related to the TriggerFetchTelemetry page
 */

export type FetchTelemetryInput = {
  start: string;
  end: string;
  ids: number[];
};

export type DeviceMake = 'Vectronic' | 'ATS' | 'Lotek';
