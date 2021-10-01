import { Transform } from 'class-transformer';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWBase, BCTWValidDates, nullToDayjs } from 'types/common_types';
import { eInputType, FormFieldObject } from 'types/form_types';
import { Dayjs } from 'dayjs';
import { eventToJSON } from './events/event';
import { OnboardingStatus } from './onboarding';

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
};

// the "base" user class, extended by onboarding and bctw user classes
export class UserBase implements UserBaseType {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role_type: eUserRole;
}

export interface IUser extends UserBaseType {
  id: number;
  idir: string;
  bceid: string;
  access: OnboardingStatus;
  // indicates if the user is considered the owner of at least one animal
  is_owner?: boolean;
}

/** 
 * the main user class representing a row in the bctw.user table 
 * todo: deprecate access, idir, bceid
 */
export class User extends UserBase implements BCTWBase<User>, IUser, BCTWValidDates {
  is_owner: boolean;
  id: number;
  idir: string;
  bceid: string;
  access: OnboardingStatus;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;

  get is_admin(): boolean {
    return this.role_type === eUserRole.administrator;
  }

  get displayProps(): (keyof User)[] {
    return ['id', 'idir', 'bceid', 'role_type', 'is_owner'];
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

  toJSON(): Partial<User> {
    const props: (keyof User)[] = ['id', 'firstname', 'lastname', 'email', 'phone', 'access'];
    if (this.idir) {
      props.push('idir');
    } else if (this.bceid) {
      props.push('bceid');
    }
    const ret = eventToJSON(props, this);
    return omitNull(ret);
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
      ret.unshift({ prop: 'idir', type: eInputType.text });
    } else if (this.bceid) {
      ret.unshift({ prop: 'bceid', type: eInputType.text });
    }
    return ret;
  }
}
