import { AxiosInstance } from 'axios';
import { IUserCritterAccessInput } from 'types/user';

type ApiProps = {
  api: AxiosInstance;
  testUser?: string;
};

// used in critter getters to specify collar attachment status
enum eCritterFetchType {
  assigned = 'assigned',
  unassigned = 'unassigned',
  all = 'all'
}

/**
 * the EditModal passes this object to parent components when the save button is clicked
 * @param isEdit adding or editing
 * @param body object of T being added
 */
interface IUpsertPayload<T> {
  // note: don't believe this is needed any longer as all endpoints are upsert-like
  // isEdit: boolean;
  body: T;
}

// interface used to construct objects for updating/granting users access to animals
interface IUserCritterPermissionInput {
  userId: number;
  access: IUserCritterAccessInput[];
}

// object that the API returns after saving user/animal permissions
interface IGrantCritterAccessResults {
  assignment_id: string;
  user_id: number;
  animal_id: string;
  valid_from: Date;
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

// most getters take an optional page
interface IBaseGetProps {
  page: number;
}

// all code retrievals must provide the code_header.code_header_name as a parameter
interface IGetCodeProps extends IBaseGetProps {
  codeHeader: string;
}

// types that can be deleted
interface IDeleteType {
  objType: 'animal' | 'collar' | 'user';
  id: string;
}

export type {
  ApiProps,
  IBulkUploadError,
  IBulkUploadResults,
  ICollarLinkPayload,
  IBaseGetProps,
  IGetCodeProps,
  IUpsertPayload,
  IUserCritterPermissionInput,
  IGrantCritterAccessResults,
  IDeleteType
};

export { eCritterFetchType };
