/**
 * types related to the TriggerFetchTelemetry page
 */

export type FetchTelemetryInput = {
  start: string;
  end: string;
  ids: number[];
};

/** returned from the api when manually trigered */
export type ResponseTelemetry = {
  device_id: number;
  records_found: number;
}

export type DeviceMake = 'Vectronic' | 'ATS' | 'Lotek';
