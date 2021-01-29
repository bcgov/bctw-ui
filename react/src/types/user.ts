import { Type } from 'class-transformer';
import { BctwBaseType } from './common_types';

export enum UserRole {
  administrator = 'administrator',
  owner = 'owner',
  observer = 'observer'
}

enum CritterPermission {
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
  role_type: UserRole;
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
  permission_type: CritterPermission;
}

export class UserCritterAccess implements IUserCritterAccess {
  id: string;
  wlh_id: string;
  nickname: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  permission_type: CritterPermission;
}