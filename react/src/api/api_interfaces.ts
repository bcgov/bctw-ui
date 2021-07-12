import { AxiosInstance } from 'axios';

// props required for all API hooks
type ApiProps = {
  api: AxiosInstance;
  testUser?: string;
};

/**
 * the EditModal passes this object to parent components when the save button is clicked
 * @param isEdit adding or editing
 * @param body object of T being added
 */
interface IUpsertPayload<T> {
  // note: don't believe this is needed any longer as all endpoints are upsert-like
  body: T;
}

// used to construct objects for removing or attaching a collar device to a critter
interface ICollarLinkPayload {
  isLink: boolean;
  data: {
    animal_id: string;
    collar_id: string;
    valid_from?: Date | string;
    valid_to?: Date | string;
  };
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
  id: string; // the uuid
}

export type {
  ApiProps,
  IBulkUploadError,
  IBulkUploadResults,
  ICollarLinkPayload,
  IUpsertPayload,
  IDeleteType
};