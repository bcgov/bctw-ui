import { Expose, Transform } from 'class-transformer';
import { Dayjs } from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
import { Animal } from './animal';
import { BCTWBaseType, BCTWValidDates, nullToDayjs } from './common_types';
import { IUserCritterAccessInput } from './user';

// interface used to construct objects for updating/granting users access to animals
export interface IUserCritterPermissionInput {
  userId: number;
  access: IUserCritterAccessInput[];
}

export enum eCritterPermission {
  // owner = 'owner', // renamed to manager
  manager = 'manager', // the user created this object
  editor = 'editor', // previously 'subowner'
  observer = 'observer', // previously 'view'
  none = 'none', // 
  admin = 'admin' // technically not an option
}

export type PermissionRequestStatus = 'approved' | 'denied' | 'pending' | 'unknown';

export type PermissionWasDeniedReason = 'Not given' | 'Add other reasons here...';
export const permissionDeniedReasons: PermissionWasDeniedReason[] = ['Not given', 'Add other reasons here...'];

// the 'stock' critter permission filter - filters out only animals with 'none' permissions
// the endpoint to fetch critter permissions uses this as a default option
const filterOutNonePermissions: eCritterPermission[] = [
  eCritterPermission.manager,
  eCritterPermission.editor,
  eCritterPermission.observer,
];

// an owner can delegate these animal permissions to other users
const ownerPermissionOptions: eCritterPermission[] = [eCritterPermission.editor, eCritterPermission.observer];
// standard for what an admin should see - includes 'none'
const adminPermissionOptions: eCritterPermission[] = [...filterOutNonePermissions, eCritterPermission.none];

/**
 * the type that an 'owner' will submit a request for other
 * users to receive animal permissions
*/
export interface IPermissionRequestInput {
  user_email_list: string[];
  critter_permissions_list: IUserCritterAccessInput[];
  request_comment?: string;
}

export class PermissionRequestInput implements IPermissionRequestInput {
  readonly request_id: number;
  user_email_list: string[];
  critter_permissions_list: IUserCritterAccessInput[];
  request_comment: string;
}

/**
 * interface that represents:
 * a) what an admin sees in the requests page - from the API schema view permission_request_v
 * b) what an owner sees in the request history table (some fields)
*/
export interface IPermissionRequest extends 
  Pick<Animal, 'animal_id' | 'wlh_id' | 'species'>, Pick<BCTWValidDates, 'valid_to'> {
  readonly request_id: number;
  requested_by: string; // idir or bceid
  requested_by_email: string;
  requested_by_name: string;
  requested_date: Dayjs;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  was_granted: boolean;
  was_denied_reason: string;
  status: PermissionRequestStatus;
}

// type PermissionRequestProps = keyof IPermissionRequest;

export class PermissionRequest implements IPermissionRequest, BCTWBaseType<PermissionRequest> {
  animal_id: string;
  wlh_id: string;
  species: string;
  request_id: number;
  requested_by: string;
  requested_by_email: string;
  requested_by_name: string;
  @Transform(nullToDayjs) requested_date: Dayjs;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  was_granted: boolean;
  was_denied_reason: string;
  @Transform(nullToDayjs) valid_to: Dayjs;
  status: PermissionRequestStatus;

  get displayProps(): (keyof PermissionRequest)[] {
    return []
  }

  get permissionStatus(): PermissionRequestStatus {
    if (this.valid_to === null) {
      return 'pending';
    } 
    switch (this.was_granted) {
      case true: 
        return 'approved';
      case false:
        return 'denied';
      default:
        return 'unknown';
    }
  }
  @Expose() get identifier(): string { return 'request_id' }
  formatPropAsHeader(str: keyof PermissionRequest): string {
    return columnToHeader(str);
  }
  toJSON(): PermissionRequest { return this }

  static get ownerHistoryPropsToDisplay(): (keyof PermissionRequest)[] {
    return [ 'wlh_id', 'animal_id', 'species', 'requested_date',
      'requested_for_name', 'requested_for_email',
      'permission_type', 'status', 'was_denied_reason' ];
  }
}


/**
 * the requests view splits one permission request into multiple rows
 * for each user email and critter/permission. This interface is used to group
 * requests by @property {request_id}
 */
export interface IGroupedRequest {
  id: number;
  requests: PermissionRequest[];
}

const groupPermissionRequests = (r: PermissionRequest[]): IGroupedRequest[] => {
  const result: IGroupedRequest[] = [];
  r.forEach(req => {
    const id = req.request_id;
    const found = result.find(f => f.id === id);
    if (found) {
      found.requests.push(req);
    } else {
      const n = {id, requests: [req]}
      result.push(n);
    }
  })
  return result;
}

/**
 * the object the admin submits to grant / denty a permission request
 * in the permission API @function {takeActionOnPermissionRequest}
*/
export interface IExecutePermissionRequest extends Pick<IPermissionRequest, 'request_id'> {
  is_grant: boolean; // whether or not to approve or deny
  was_denied_reason: string; // optional message if the request is being denied
}

/* permission-related helpers */
const permissionCanModify = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.admin || p === eCritterPermission.editor || p === eCritterPermission.manager;
};

const canRemoveDeviceFromAnimal = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.manager|| p === eCritterPermission.admin;
};

export {
  adminPermissionOptions,
  ownerPermissionOptions,
  permissionCanModify,
  canRemoveDeviceFromAnimal,
  filterOutNonePermissions,
  groupPermissionRequests,
};
