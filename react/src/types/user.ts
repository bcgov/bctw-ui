import { Type, Expose } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { BCTWBase, BCTWBaseType } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { eCritterPermission } from 'types/permission';
import { Animal } from './animal';
import { Collar } from './collar';

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
 * the 'access' column in the bctw."user" table
 */
export type OnboardingStatus = 'pending' | 'granted' | 'denied';

/**
 * representation of the bctw.user table
 */
export interface IUser extends BCTWBaseType, Pick<IKeyCloakSessionInfo, 'email'> {
  id: number;
  idir: string;
  bceid: string;
  firstname: string;
  lastname: string;
  access: OnboardingStatus;
  role_type: eUserRole;
  // indicates if the user is considered the owner of at least one animal
  is_owner?: boolean; 
  phone: string;
}

// used in the class to get a type safe array of valid keys
type UserProps = keyof IUser;
export class User extends BCTWBase implements IUser {
  role_type: eUserRole;
  is_owner: boolean;
  id: number;
  idir: string;
  bceid: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  access: OnboardingStatus;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  @Expose() get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }
  static get propsToDisplay(): UserProps[] {
    return ['id', 'idir', 'bceid', 'role_type', 'is_owner'];

  }
  /**
   * gets either the IDIR or BCEID, whichever is present
   * todo: need a better name? cannot use "identifier" as
   * it conflicts with the table row identifier property
   */
  @Expose() get uid(): string {
    return this.idir ?? this.bceid ?? 'user';
  }
  get identifier(): string { return 'id' }

  toJSON(): User { return this; }

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

export interface IUserCritterAccess extends Required<Pick<Animal, 'permission_type'>>,
  Pick<Animal, 'critter_id' | 'animal_id' | 'species' | 'wlh_id' | 'valid_from' | 'valid_to'>,
  Pick<Collar, 'device_id' | 'device_make' | 'frequency'> {}

export interface IUserCritterAccessInput extends 
  Partial<Omit<IUserCritterAccess, 'critter_id' | 'permission_type'>>, 
  Required<Pick<IUserCritterAccess, 'critter_id' | 'permission_type'>> {}

type UserCritterAcessProps = keyof IUserCritterAccessInput;

export class UserCritterAccess extends BCTWBase implements IUserCritterAccess {
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
  toJSON(): UserCritterAccess { return this }

  formatPropAsHeader(str: keyof UserCritterAccess): string { return columnToHeader(str) }

  // displayed as fields 'user/critter permission' table modals
  static get propsToDisplay(): UserCritterAcessProps[] {
    return ['wlh_id', 'animal_id', 'species', 'device_id', 'device_make', 'frequency', 'permission_type'];
  }
}
