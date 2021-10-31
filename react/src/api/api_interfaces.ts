import { AxiosInstance } from 'axios';

// props required for all API hooks
type ApiProps = {
  api: AxiosInstance;
};

/**
 * the EditModal passes this object to parent components when the save button is clicked
 * @param isEdit adding or editing
 * @param body object of T being added
 */
interface IUpsertPayload<T> {
  body: T;
}

// what an error looks like when performing a bulk import
interface IBulkUploadError {
  error: string;
  row: JSON;
  rownum: number;
}

// what the results should look like after a successfull bulk import
interface IBulkUploadResults<T> {
  errors: IBulkUploadError[];
  results: T[];
}

// types that can be deleted
interface IDeleteType {
  objType: 'animal' | 'collar' | 'user';
  id: string | number; // the uuid
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type API = Record<string, (...args: any) => Promise<any>>;

interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
  noApiPrefix?: boolean;
}

export type {
  API,
  ApiProps,
  CreateUrlParams,
  IBulkUploadError,
  IBulkUploadResults,
  IUpsertPayload,
  IDeleteType
};