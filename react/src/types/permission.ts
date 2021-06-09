import { Expose } from 'class-transformer';
import { columnToHeader } from 'utils/common';
import { BCTW } from './common_types';

export enum eCritterPermission {
  owner = 'owner', // the user created this object
  subowner = 'subowner', //
  view = 'view',
  none = 'none',
  change = 'change', // to be removed
  admin = '' // technically not an option
}

// the 'stock' critter permission filter - filters out only animals with 'none' permissions
// the endpoint to fetch critter permissions uses this as a default option
const filterOutNonePermissions: eCritterPermission[] = [
  eCritterPermission.owner,
  eCritterPermission.subowner,
  eCritterPermission.view,
  eCritterPermission.change
];

// an owner can delegate these animal permissions to other users
const ownerPermissionOptions: eCritterPermission[] = [eCritterPermission.subowner, eCritterPermission.view];
// standard for what an admin should see - includes 'none'
const adminPermissionOptions: eCritterPermission[] = [...filterOutNonePermissions, eCritterPermission.none];

// what's displayed as fields in most 'critter picker' tables
const permissionTableBasicHeaders = ['animal_id', 'wlh_id', 'device_id', 'device_make', 'frequency', 'permission_type'];

/**
 * the type that an 'owner' will submit a request for other
 * users to receive animal permissions
*/
export interface IPermissionRequestInput {
  // request_id: number;
  user_email_list: string[];
  // note: actually the critter_id :(
  // todo: convert to IUserCritterAccess?
  critter_permissions_list: {
    animal_id: string;
    permission_type: eCritterPermission;
  }[];
  request_comment?: string;
}

export class PermissionRequestInput implements IPermissionRequestInput {
  request_id: number;
  user_email_list: string[];
  critter_permissions_list: {
    animal_id: string;
    permission_type: eCritterPermission;
  }[];
  request_comment: string;
}

/**
 * what an admin sees in the requests page.
 * retrieved from the API schema view permission_request_v
*/
export interface IPermissionRequest {
  animal_id: string;
  wlh_id: string;
  request_id: number;
  requested_by_email: string;
  requested_by_name: string;
  requested_at: Date;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  // flag indicating whether or not the request has been granted/denied
  is_expired: boolean;
}

export class PermissionRequest implements BCTW {
  animal_id: string;
  wlh_id: string;
  request_id: number;
  requested_by_email: string;
  requested_by_name: string;
  requested_at: Date;
  request_comment: string;
  requested_for_email: string;
  requested_for_name: string;
  permission_type: eCritterPermission;
  is_expired: boolean;
  @Expose() get identifier(): string {
    return 'request_id';
  }
  formatPropAsHeader(str: string): string {
    return columnToHeader(str);
  }
}

export interface IGroupedRequest {
  id: number;
  requests: PermissionRequest[];
}

// todo: doc
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
}

/* permission-related helpers */
const permissionCanModify = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.admin || p === eCritterPermission.subowner || p === eCritterPermission.owner;
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
  permissionTableBasicHeaders,
  groupPermissionRequests
};
