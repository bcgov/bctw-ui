import { MapRange } from './map';

export enum eExportType {
  all = 'all',
  animal = 'animal',
  collar = 'collar',
  movement = 'movement',
}

interface ExportQueryParams {
  critter_ids: string[];
  collar_ids: string[];
  type: eExportType
  range?: MapRange;
}

interface ExportQuery {
  key: string,
  operator: string,
  term: string[]
}

interface ExportAllParams {
  bctw_queries: ExportQuery[];
  range: MapRange;
  polygons: string[];
  lastTelemetryOnly: boolean;
  attachedOnly: boolean;
}

export type {
  ExportQueryParams,
  ExportAllParams
}