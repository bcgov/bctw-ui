import { Expose, Transform } from 'class-transformer';
import { columnToHeader } from 'utils/common';
import { dateObjectToTimeStr } from 'utils/time';
import { Animal } from './animal';
import { BCTW, BCTWBaseType } from './common_types';
import { IUserCritterAccessInput } from './user';

export enum eCritterPermission {
  owner = 'owner', // the user created this object
  editor = 'editor', // previously 'subowner'
  observer = 'observer', // previously 'view'
  none = 'none', // 
  admin = 'admin' // technically not an option
}

// the 'stock' critter permission filter - filters out only animals with 'none' permissions
// the endpoint to fetch critter permissions uses this as a default option
const filterOutNonePermissions: eCritterPermission[] = [
  eCritterPermission.owner,
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
  request_id: number;
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
  Pick<Animal, 'animal_id' | 'wlh_id' | 'species'>, Pick<BCTWBaseType, 'valid_to'> {
  request_id: number;
  requested_by: string; // idir or bceid
  requested_by_email: string;
  requested_by_name: string;
  requested_date: Date;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  was_granted: boolean;
  was_denied_reason: string;
}

export type PermissionRequestStatus = 'approved' | 'denied' | 'pending' | 'unknown';
export class PermissionRequest implements BCTW, IPermissionRequest {
  animal_id: string;
  wlh_id: string;
  species: string;
  request_id: number;
  requested_by: string;
  requested_by_email: string;
  requested_by_name: string;
  // todo: all dates should do this?
  @Transform((t) => dateObjectToTimeStr(t)) requested_date: Date;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  was_granted: boolean;
  was_denied_reason: string;
  valid_to: Date;
  @Expose() get status(): PermissionRequestStatus {
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
  @Expose() get identifier(): string {
    return 'request_id';
  }
  formatPropAsHeader(str: string): string {
    return columnToHeader(str);
  }
}

// note: new way to create 'typeable' list of fields
// used in OwnerRequestPermission
const NewPermRequest = new PermissionRequest();
const OwnerHistoryFields: (keyof typeof NewPermRequest)[] = [
  'wlh_id', 'animal_id', 'species', 'requested_date',
  'requested_for_name', 'requested_for_email',
  'permission_type', 'status', 'was_denied_reason',
];


// strings that an admin can choose from for default 'im denying this permission because...'
const ReasonsPermissionWasDenied = [
  'Not given',
  'Add other reasons here...',
];

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
  const result = [];
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
  return p === eCritterPermission.admin || p === eCritterPermission.editor || p === eCritterPermission.owner;
};

const canRemoveDeviceFromAnimal = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.owner || p === eCritterPermission.admin;
};

export {
  adminPermissionOptions,
  ownerPermissionOptions,
  permissionCanModify,
  canRemoveDeviceFromAnimal,
  filterOutNonePermissions,
  groupPermissionRequests,
  OwnerHistoryFields,
  ReasonsPermissionWasDenied
};
