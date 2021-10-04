import { columnToHeader } from 'utils/common_helpers';
import { BCTWBase } from 'types/common_types';

export enum eUserRole {
  administrator = 'administrator',
  // editor = 'editor',
  owner = 'owner',
  observer = 'observer'
}

export type KeyCloakDomainType = 'idir' | 'bceid';

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

// properties that all user classes implement
type UserBaseType = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role_type: eUserRole;
  domain: KeyCloakDomainType;
  username: string;
};

// the "base" user class, extended by onboarding and bctw user classes
export class UserBase implements UserBaseType {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role_type: eUserRole;
  domain: KeyCloakDomainType;
  username: string;
}

export interface IUser extends UserBaseType {
  id: number;
  idir: string;
  bceid: string;
  // indicates if the user is considered the owner of at least one animal
  is_owner?: boolean;
}

/** 
 * the main user class representing a row in the bctw.user table 
 * todo: deprecate idir, bceid
 */
export class User extends UserBase implements BCTWBase<User>, IUser {
  is_owner: boolean;
  id: number;
  idir: string;
  bceid: string;

  get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }

  get displayProps(): (keyof User)[] {
    return ['id', 'username', 'idir', 'bceid', 'role_type', 'is_owner'];
  }
  /**
   * gets either the IDIR or BCEID, whichever is present
   * todo: need a better name? cannot use "identifier" as
   * it conflicts with the table row identifier property
   */
  get uid(): string {
    return this.idir ?? this.bceid ?? 'user';
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
