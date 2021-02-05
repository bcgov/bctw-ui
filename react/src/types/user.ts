import { Type } from 'class-transformer';
import { BctwBaseType } from './common_types';

export enum eUserRole {
  administrator = 'administrator',
  owner = 'owner',
  observer = 'observer'
}

export enum eCritterPermission {
  view = 'view',
  change = 'change'
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

export interface IUserCritterAccess {
  id: string;
  wlh_id: string;
  nickname: string;
  valid_from: Date
  valid_to: Date;
  permission_type: eCritterPermission;
}

export class UserCritterAccess implements IUserCritterAccess {
  id: string;
  wlh_id: string;
  nickname: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  permission_type: eCritterPermission;
}