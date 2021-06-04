import { BCTWBaseType } from './common_types';

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

// what's displayed as fields in most 'critter picker' tables
const permissionTableBasicHeaders = ['animal_id', 'wlh_id', 'device_id', 'device_make', 'frequency', 'permission_type'];

/**
 * the type that an 'owner' will submit a request for other
 * users to receive animal permissions
 */
export interface IPermissionRequestInput {
  request_id: number;
  user_email_list: string[];
  // note: actually the critter_id :(
  // todo: convert to IUserCritterAccess?
  critter_permissions_list: {
    animal_id: string;
    permission_type: eCritterPermission;
  }[];
  request_comment: string;
}

/**
 * the request type that an administrator will see
 */
export interface IPermissionRequest
  extends Omit<IPermissionRequestInput, 'user_emails'>,
  Pick<BCTWBaseType, 'valid_from' | 'valid_to' | 'created_at'> {
  user_id_list: number[];
  requested_by_user_id: number;
}

/* permission-related helpers */
const permissionCanModify = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.admin || p === eCritterPermission.subowner || p === eCritterPermission.owner;
};

const canRemoveDeviceFromAnimal = (p: eCritterPermission): boolean => {
  return p === eCritterPermission.owner || p === eCritterPermission.admin;
};

export { permissionCanModify, canRemoveDeviceFromAnimal, filterOutNonePermissions, permissionTableBasicHeaders };
