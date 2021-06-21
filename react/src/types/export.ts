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

export type {
  ExportQueryParams
}