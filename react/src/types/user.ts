import { Type, Expose } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { BCTW, BCTWBaseType } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { eCritterPermission } from 'types/permission';

export enum eUserRole {
  administrator = 'administrator',
  owner = 'owner',
  observer = 'observer'
}

type KeyCloakDomainType = 'idir' | 'bceid';
/**
 * interface representing the keycloak object retrieved 
 * in the UserContext.tsx
 */
export interface IKeyCloakSessionInfo {
  domain: KeyCloakDomainType;
  username: string;
  email: string;
  family_name: string;
  given_name: string;
}

/**
 * representation of the bctw.user table
 */
export interface IUser extends BCTW, BCTWBaseType, Pick<IKeyCloakSessionInfo, 'email'> {
  id: number;
  idir: string;
  bceid: string;
  firstname: string;
  lastname: string;
  // indicates if the user is considered the owner of at least one animal
  is_owner?: boolean; 
}

export class User implements IUser {
  role_type: eUserRole;
  is_owner: boolean;
  id: number;
  idir: string;
  bceid: string;
  firstname: string;
  lastname: string;
  email: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  @Expose() get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'idir': 
      case 'id':
      case 'bceid':
        return str.toUpperCase();
      default: 
        return columnToHeader(str);
    }
  }

  get formFields(): FormFieldObject<User>[] {
    const ret: FormFieldObject<User>[] = [
      { prop: 'email', type: eInputType.text },
      { prop: 'firstname', type: eInputType.text },
      { prop: 'lastname', type: eInputType.text }
    ];
    // a user should only have one of theses
    if (this.idir) {
      ret.unshift({prop: 'idir', type: eInputType.text })
    } else if (this.bceid) {
      ret.unshift({prop: 'bceid', type: eInputType.text })
    }
    return ret;
  }
}

/**
 * todo:
 */
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

export interface IUserCritterAccessInput extends Partial<IUserCritterAccess> {
  critter_id: string;
  permission_type: eCritterPermission;
}

export class UserCritterAccess implements IUserCritterAccess {
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  species: string;
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

const TestUCA = new UserCritterAccess();
// what's displayed as fields 'user/critter permission' table modals
export const PermissionTableHeaders: (keyof typeof TestUCA)[] = [
  'wlh_id', 'animal_id', 'species',
  'device_id', 'device_make', 'frequency',
  'permission_type'
];
