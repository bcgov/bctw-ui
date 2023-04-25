import dayjs, { Dayjs } from 'dayjs';
import { Transform } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { Animal, ICollectionUnit } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, nullToDayjs, PartialPick } from 'types/common_types';
import { eCritterPermission } from 'types/permission';

export interface IUserCritterAccess
  extends Required<Pick<Animal, 'permission_type'>>,
    Pick<Animal, 'critter_id' | 'animal_id' | 'taxon' | 'wlh_id' | 'valid_from' | 'valid_to' | 'collection_unit'>,
    Pick<Collar, 'device_id' | 'device_make' | 'device_type' | 'frequency'> {}

export type IUserCritterAccessInput = Required<Pick<IUserCritterAccess, 'critter_id' | 'permission_type'>> &
  PartialPick<IUserCritterAccess, 'animal_id' | 'wlh_id'>;

export class UserCritterAccess implements IUserCritterAccess, BCTWBase<UserCritterAccess> {
  permission_type: eCritterPermission;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  taxon: string;
  collection_unit: ICollectionUnit[];
  managed_by: string;
  edited_by: string;
  observed_by: string;
  @Transform(nullToDayjs) valid_from: Dayjs;
  @Transform(nullToDayjs) valid_to: Dayjs;
  device_id: number;
  device_type: string;
  frequency: number;
  device_make: string;
  date_recorded: Dayjs;
  row_count?: number;
  get identifier(): string {
    return 'critter_id';
  }
  get name(): string {
    return this.animal_id ?? this.wlh_id;
  }
  // Get a comma-separated string of collection_unit's keys and values
  // TODO: Decide on the exact format we want for this
  get collection_unit_display(): string {
    const collectionUnitArray = this.collection_unit?.map(unit => {
      const unitString = Object.entries(unit).map(([key, value]) => `${key}: ${value}`);
      return unitString;
    });
    return collectionUnitArray?.join(', ') ?? '';
  }
  // Get the permission_type value or 'none' if it does not exist
  get permission_type_display(): eCritterPermission {
    return this.permission_type ?? eCritterPermission.none;
  }
  toJSON(): UserCritterAccess {
    return this;
  }

  formatPropAsHeader(str: keyof UserCritterAccess): string {
    return columnToHeader(str);
  }

  // displayed as fields 'user/critter permission' table modals
  static get propsToDisplay(): (keyof UserCritterAccess)[] {
    return [
      'permission_type_display',
      'wlh_id',
      'animal_id',
      'taxon',
      'collection_unit_display',
      'device_id',
      'frequency',
      'device_type',
      'device_make'
    ];
  }
  get displayProps(): (keyof UserCritterAccess)[] {
    return UserCritterAccess.propsToDisplay;
  }

  static get animalManagerDisplayProps(): (keyof UserCritterAccess)[] {
    return [...UserCritterAccess.propsToDisplay, 'managed_by', 'edited_by', 'observed_by'];
  }

  get animalManagerDisplayProps(): (keyof UserCritterAccess)[] {
    return UserCritterAccess.animalManagerDisplayProps;
  }
}
