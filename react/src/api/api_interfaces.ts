import { AxiosInstance } from 'axios';
import { ITableFilter } from 'components/table/table_interfaces';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
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

type CellErrorDescriptor = {
  desc: string;
  help: string;
  valid_values?: string[];
};

type ParsedXLSXCellError = {
  [key in (keyof Animal | keyof Collar) | 'identifier' | 'missing_data']?: CellErrorDescriptor;
};

type WarningInfo = {
  message: string;
  help: string;
  row: number; //The row index
  checked: boolean;
};

type CheckedWarningInfo = WarningInfo & { checked: boolean };

type AnimalCollar = Animal | Collar;

type XLSXPayload = {
  user_id: number;
  payload: AnimalCollar[];
};

type ParsedXLSXRowResult = {
  row: AnimalCollar;
  errors: ParsedXLSXCellError;
  warnings: WarningInfo[];
  success: boolean;
};

type ParsedXLSXSheetResult = {
  headers: string[];
  rows: ParsedXLSXRowResult[];
};

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
  IDeleteType,
  ParsedXLSXCellError,
  ParsedXLSXRowResult,
  ParsedXLSXSheetResult,
  WarningInfo,
  CellErrorDescriptor,
  CheckedWarningInfo,
  AnimalCollar,
  XLSXPayload
};
