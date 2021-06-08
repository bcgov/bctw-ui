import { Type, Expose } from 'class-transformer';
import { columnToHeader } from 'utils/common';
import { BCTW, BCTWBaseType } from 'types/common_types';
import { FormFieldObject } from 'types/form_types';
import { eCritterPermission } from 'types/permission';

export enum eUserRole {
  administrator = 'administrator',
  owner = 'owner',
  observer = 'observer'
}

export interface IUser extends BCTW, BCTWBaseType {
  id: number;
  idir: string;
  bceid: string;
  email: string;
  // indicates if the user is considered the owner of at least one animal
  is_owner?: boolean; 
}

export class User implements IUser {
  role_type: eUserRole;
  is_owner: boolean;
  id: number;
  idir: string;
  bceid: string;
  email: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  @Expose() get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }

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

/**
 * note: the database uses animal id since the bctw.user_aniaml_assignment table hasn't been updated from animal_id -> critter_id.
*/
export interface IUserCritterAccessInput extends Partial<IUserCritterAccess> {
  critter_id: string;
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