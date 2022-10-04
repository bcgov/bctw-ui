import { eUserRole, IUser, KeyCloakDomainType, UserBase } from 'types/user';
import { BaseTimestamps, BCTWBase, BCTWValidDates, nullToDayjs } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { isDev } from 'api/api_helpers';
import dayjs, { Dayjs } from 'dayjs';
import { Transform } from 'class-transformer';

/**
 * the 'access' column in the bctw.onboarding table
 */
export type OnboardingStatus = 'pending' | 'granted' | 'denied';
//
export interface IOnboardUser extends BCTWValidDates, Required<Pick<BaseTimestamps, 'created_at'>> {
  onboarding_id: number;
  reason: string;
  access: OnboardingStatus;
}

export class OnboardUser extends UserBase implements BCTWBase<OnboardUser>, IOnboardUser {
  readonly onboarding_id: number;
  domain: KeyCloakDomainType;
  username: string;
  reason: string;
  keycloak_guid: string;
  access: OnboardingStatus;
  role_type: eUserRole;

  /** include these timestamps for @method canRequestBeResubmitted */
  @Transform(nullToDayjs) readonly created_at: Dayjs;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;

  // a user can re-submit an onboarding request if the denied request is older than 7 days
  get canRequestBeResubmitted(): boolean {
    if (this.access !== 'denied') {
      return false;
    }
    // consider valid_to to be the timestamp the request was denied
    if (!this.valid_to.isValid()) {
      return false;
    }
    const oneWeekAfter = this.valid_to.add(7, 'day');
    const hasWeekElapsed = dayjs().isAfter(oneWeekAfter);
    // console.log('request resubmission possible?', oneWeekAfter, hasWeekElapsed);
    return hasWeekElapsed;
  }

  get identifier(): keyof OnboardUser {
    return 'onboarding_id';
  }

  formatPropAsHeader(s: keyof OnboardUser): string {
    return columnToHeader(s);
  }

  get displayProps(): (keyof OnboardUser)[] {
    const props: (keyof OnboardUser)[] = [
      'username',
      'firstname',
      'lastname',
      'email',
      'phone',
      'access',
      'role_type',
      'reason',
      'created_at'
    ];
    if (isDev()) {
      props.unshift('onboarding_id', 'domain');
    }
    return props;
  }
}

// sent as part of the onboarding request
// currently only used as details in the email sent to admin
export interface IOnboardEmailDetails {
  populationUnit?: string;
  projectManager?: string;
  projectName?: string;
  projectRole?: string;
  region?: string;
  species?: string;
}

export class OnboardUserRequest {
  user: OnboardUser;
  emailInfo: IOnboardEmailDetails;
  constructor() {
    this.user = new OnboardUser();
    this.emailInfo = {};
  }
}

// what an admin passes to the API to grant/deny an onboard request
export type HandleOnboardInput = Pick<IOnboardUser, 'onboarding_id' | 'access'> &
  Pick<IUser, 'role_type' | 'email' | 'firstname' | 'keycloak_guid'>;
