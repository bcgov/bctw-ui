export enum eExportType {
  all = 'all',
  animal = 'animal',
  collar = 'collar',
  movement = 'movement',
}

interface exportQueryParams {
  id: string[];
  type: eExportType
}

export type {
  exportQueryParams
}