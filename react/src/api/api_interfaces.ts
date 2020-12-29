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
}
