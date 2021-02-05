import { IUserCritterAccess, eCritterPermission } from 'types/user'

interface RequestPingParams {
  timeWindow: number[];
  pingExtent: string;
}

enum eCollarType {
  Assigned = 'Assigned',
  Available = 'Available'
}

// used in critter getters to specify collar attachment status
enum eCritterFetchType {
  assigned = 'assigned',
  unassigned= 'unassigned',
  all = 'all'
}

interface IUpsertPayload<T> {
  isEdit: boolean;
  body: T;
}

interface ICritterAccess {
  animal_id: string;
  permission_type: eCritterPermission;
}
interface IUserCritterPermissionInput {
  userId: number;
  access: ICritterAccess[]
}

interface IGrantCritterAccessResults {
  assignment_id: string;
  user_id: number;
  animal_id: string;
  valid_from: Date;
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
  IBulkUploadResults,
  ICollarLinkPayload,
  IBaseGetProps,
  IGetCodeProps,
  IUpsertPayload,
  IUserCritterPermissionInput,
  // IGrantCritterAccessInput,
  IGrantCritterAccessResults,
  ICritterAccess
}

export {
  eCollarType,
  eCritterFetchType
}
