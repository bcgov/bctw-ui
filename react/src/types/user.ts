import { Type, Expose } from 'class-transformer';
import { columnToHeader } from 'utils/common';
import { BCTW, BCTWBaseType } from './common_types';
import { FormFieldObject } from './form_types';

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

export interface IUser extends BCTW, BCTWBaseType {
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

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'idir': 
      case 'bceid':
        return str.toUpperCase();
      default: 
        return columnToHeader(str);
    }
  }
}

export const userFormFields: FormFieldObject[] = [
  { prop: 'idir' },
  { prop: 'bceid' },
  { prop: 'email' },
]

export interface IUserCritterAccessInput {
  critter_id: string;
  permission_type: eCritterPermission;
}
export interface IUserCritterAccess {
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  valid_from: Date;
  valid_to: Date;
  device_id: number;
  device_make: string;
  frequency: number;
  permission_type: eCritterPermission;
}

export class UserCritterAccess implements IUserCritterAccess {
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  device_id: number;
  frequency: number;
  device_make: string;
  permission_type: eCritterPermission;
  @Expose() get identifier(): string { return 'critter_id' }
  @Expose() get name(): string {
    return this.animal_id ?? this.wlh_id;
  }
}