/**
 * types related to the TriggerFetchTelemetry page
 */
export type DeviceMake = 'Vectronic' | 'ATS' | 'Lotek';

export type FetchTelemetryInput = {
  start: string;
  end: string;
  ids: number[];
  vendor: DeviceMake;
};

/** returned from the api when manually trigered */
export type ResponseTelemetry = {
  device_id: number;
  records_found: number;
  records_inserted: number;
  vendor: DeviceMake;
  error: string;
}

export type TelemetryResultCounts = {
  found: number;
  inserted: number;
  errors: number;
}

