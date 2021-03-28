export enum eExportType {
  all = 'all',
  animal = 'animal',
  collar = 'collar',
  movement = 'movement',
}

interface exportQueryParams {
  ids: string[];
  type: eExportType
}

export type {
  exportQueryParams
}