import { Animal } from "types/animal";
import { Collar } from "types/collar";

/**
 * @param query - name of api hook 
 * @param queryProp - param to pass to hook
 * @param onNewData handler to call when new data is loaded
 */
interface ITableQueryProps<T> {
  query: string;
  queryParam?: string | number;
  onNewData?: (data: T[]) => void;
}
interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

export enum eCollarType {
  Assigned = 'Assigned',
  Available = 'Available'
}

interface IUpsertPayload<T> {
  isEdit: boolean;
  body: T;
}

interface ICollarLinkPayload {
  isLink: boolean;
  data: {
    animal_id: string,
    collar_id: string,
    valid_from: Date | string,
    valid_to?: Date | string
  }
}
interface BulkUploadError {
  error: string;
  row: JSON;
  rownum: number
}
interface IBulkUploadResults<T> {
  errors: BulkUploadError[];
  results: T[];
}

interface IBaseGetProps {
  page: number;
}

interface IGetCodeProps extends IBaseGetProps {
  codeHeader: string;
}

export type {
  RequestPingParams,
  ITableQueryProps,
  IBulkUploadResults,
  ICollarLinkPayload,
  IBaseGetProps,
  IGetCodeProps,
  IUpsertPayload,
}
