import { capitalize, columnToHeader } from 'utils/common_helpers';
import { BCTWBase } from 'types/common_types';
import { isDev } from 'api/api_helpers';

export enum eUserRole {
  administrator = 'administrator',
  //manager = 'manager', //Removed from DB and enum. Not used...
  user = 'user',
  data_administrator = 'data_administrator'
}

export type KeyCloakDomainType = 'idir' | 'bceid';

/**
 * interface representing the keycloak object retrieved
 * in the @file UserContext.tsx
 */
export interface IKeyCloakSessionInfo {
  domain: KeyCloakDomainType;
  username: string;
  email: string;
  family_name: string;
  given_name: string;
  keycloak_guid: string;
}

// all user classes implement
type UserBaseType = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role_type: eUserRole;
  domain: KeyCloakDomainType;
  username: string;
  keycloak_guid: string;
};

/**
 * the base user class
 * extended by @class OnboardUser and @class User
 */
export class UserBase implements UserBaseType {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role_type: eUserRole;
  domain: KeyCloakDomainType;
  username: string;
  keycloak_guid: string;
}

export interface IUser extends UserBaseType {
  id: number;
  idir: string;
  bceid: string;
  // indicates if the user is considered the manager of at least one animal
  is_manager?: boolean;
}

/**
 * the main user class representing a row in the bctw.user table
 */
export class User extends UserBase implements BCTWBase<User>, IUser {
  is_manager: boolean;
  id: number;
  idir: string;
  bceid: string;
  keycloak_guid: string;
  get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }

  get displayProps(): (keyof User)[] {
    const props: (keyof User)[] = ['name', 'username', 'email', 'idir', 'bceid', 'role_type', 'is_manager'];
    if (isDev()) {
      props.unshift('id');
    }
    return props;
  }

  get name(): string {
    return this.firstname && this.lastname ? capitalize(`${this.firstname} ${this.lastname}`) : 'unknown';
  }

  get identifier(): string {
    return 'id';
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
}
