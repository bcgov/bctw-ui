import { Type } from 'class-transformer';
import { BctwBaseType } from './common_types';

export enum eUserRole {
  administrator = 'administrator',
  owner = 'owner',
  observer = 'observer'
}

export enum eCritterPermission {
  view = 'view',
  change = 'change',
  none = 'none',
}

export interface IUser extends BctwBaseType {
  id: number;
  idir: string;
  bceid: string;
  email: string;
}

export class User implements IUser {
  role_type: eUserRole;
  id: number;
  idir: string;
  bceid: string;
  email: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
}

// fixme: 
export interface IUserCritterAccessInput {
  id: string;
  // animal_id: string;
  permission_type: eCritterPermission;
}
export interface IUserCritterAccess {
  id: string
  wlh_id: string;
  nickname: string;
  valid_from: Date
  valid_to: Date;
  device_id: number;
  collar_make: string;
  permission_type: eCritterPermission;
}

export class UserCritterAccess implements IUserCritterAccess {
  id: string;
  wlh_id: string;
  nickname: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  device_id: number;
  collar_make: string;
  permission_type: eCritterPermission;
}