import { Animal, IAnimal } from 'types/animal';
import { ICollar } from 'types/collar';
interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

interface ICritterResults {
  assigned: Animal[];
  available: Animal[];
}

export enum eCollarType {
  Assigned = 'Assigned',
  Available = 'Available',
  All = 'All'
}

interface ICollarResults {
  assigned: ICollar[];
  available: ICollar[]
}

interface ICollarLinkPayload {
  isLink: boolean;
  data: {
    animal_id: number,
    device_id: number,
    start_date: Date | string,
    end_date?: Date | string
  }
}

interface BulkUploadError {
  error: string;
  row: any;
  rownum: number
}
interface IBulkUploadResults<T> {
  errors: BulkUploadError[];
  results: T[];
}


export type {
  RequestPingParams,
  IBulkUploadResults,
  ICritterResults,
  ICollarResults,
  ICollarLinkPayload,
}
