import { Transform } from 'class-transformer';
import { Dayjs } from 'dayjs';
import { Critter, ICollectionUnit } from 'types/animal';
import { Collar } from 'types/collar';
import { BCTWBase, PartialPick, getCollectionUnitKeys, getCollectionUnitProps, nullToDayjs } from 'types/common_types';
import { eCritterPermission } from 'types/permission';
import { columnToHeader } from 'utils/common_helpers';

export interface IUserCritterAccess
  extends Required<Pick<Critter, 'permission_type'>>,
    Pick<Critter, 'critter_id' | 'animal_id' | 'taxon' | 'wlh_id' | 'collection_unit'>,
    Pick<Collar, 'device_id' | 'device_make' | 'device_type' | 'frequency'> {}

export type IUserCritterAccessInput = Required<Pick<IUserCritterAccess, 'critter_id' | 'permission_type'>> &
  PartialPick<IUserCritterAccess, 'animal_id' | 'wlh_id'>;

// * Instantiate this class with createFlattenedProxy() to expose collection_units dynamically
export class UserCritterAccess implements IUserCritterAccess, BCTWBase<UserCritterAccess> {
  permission_type: eCritterPermission;
  critter_id: string;
  animal_id: string;
  wlh_id: string;
  taxon: string;
  collection_units: ICollectionUnit[];
  collection_unit: string;
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

  // Getter for properties in collection_units
  get collectionUnitProps(): Record<string, string> {
    return getCollectionUnitProps(this.collection_units);
  }

  // Getter to return the keys of the new properties
  get collectionUnitKeys(): string[] {
    return getCollectionUnitKeys(this.collection_units);
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
      'taxon',
      'wlh_id',
      'animal_id',
      'device_id',
      'frequency',
      'device_type',
      'device_make'
    ];
  }
  displayProps(): (keyof UserCritterAccess)[] {
    return UserCritterAccess.propsToDisplay;
  }

  static get animalManagerDisplayProps(): (keyof UserCritterAccess)[] {
    return [...UserCritterAccess.propsToDisplay, 'managed_by', 'edited_by', 'observed_by'];
  }

  get animalManagerDisplayProps(): (keyof UserCritterAccess)[] {
    return UserCritterAccess.animalManagerDisplayProps;
  }
}
