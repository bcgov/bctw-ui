import { AxiosInstance } from 'axios';
import { ITableFilter } from 'components/table/table_interfaces';
import { uuid } from 'types/common_types';

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

// models that can be deleted
interface IDeleteType {
  objType: 'animal' | 'collar' | 'user';
  id: uuid | number; // users have number ids
}

// an API object 
// todo: improve typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type API = Record<string, (...args: any) => Promise<any>>;


interface CreateUrlParams {
  api: string;
  query?: string;
  page?: number;
  noApiPrefix?: boolean;
  search?: ITableFilter[];
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