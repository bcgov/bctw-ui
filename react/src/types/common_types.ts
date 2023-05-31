import dayjs, { Dayjs } from 'dayjs';
import { formatTime } from 'utils/time';
import { UserCritterAccess } from './animal_access';
import { TelemetryDetail } from './map';
import { headerToColumn } from 'utils/common_helpers';
import { Critter, ICollectionUnit } from './animal';
import { CbPayload } from './events/event';

export interface BCTWValidDates {
  valid_from: Date | Dayjs;
  // a null valid_to indicates the 'current' record
  valid_to: Date | Dayjs;
}

// most database tables contain these columns for transactional history
export interface BaseTimestamps extends PartialPick<BCTWValidDates, 'valid_from' | 'valid_to'> {
  created_at?: Dayjs;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
}

// extended for types / classes that implement formatters
export type BCTWFormat<T> = {
  formatPropAsHeader(k: keyof T): string;
  get displayProps(): (keyof T)[];
  historyDisplayProps?(): (keyof T)[];
  critterbasePayload?: CbPayload<T>;
};

/**
 * extended primarily by other types/classes that are used in table components
 */
export interface BCTWBase<T> extends BaseTimestamps, BCTWFormat<T> {
  // Critter/Collar types may include this
  owned_by_user_id?: number;
  //used in cross join queries with critterbase
  _merged?: boolean;
  row_count?: number;
  // used in tables to identify unique rows
  get identifier(): string;
}

/**
 * similar to the @type {Code}, currently just a string alias
 */
export type uuid = string;

/**
 * defines the main object types that have metadata in BCTW
 * todo: deprecate this :[
 */
export type BCTWType = 'animal' | 'device';

// optionally extend keys from a type
export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

/**
 * used with transforming types from the API
 * generally only care about object received from API -> instance of UI class
 * ex. nulls can be transformed to a boolean or number
 */
const toClassOnly = { toClassOnly: true };
const toPlainOnly = { toPlainOnly: true };

const nullOrDayjs = (v: Date | null): Dayjs | null => (v ? dayjs(v) : null);
const nullToDayjs = (v: Date | null): Dayjs => dayjs(v);
const DayjsToPlain = (v: Dayjs): string => v?.format(formatTime);

// Flattens the collection units inner array into regular getter properties
const createFlattenedProxy = <T extends Critter | UserCritterAccess | TelemetryDetail>(object: T): T => {
  return new Proxy(object, {
    get: (target: T, prop: string): unknown => {
      if (prop === 'collection_units') {
        return target[prop] ?? [];
      }

      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop);
      }

      return target.collectionUnitProps[prop] ?? undefined;
    }
  });
};

// Common helper function to expose collectionUnitProps
const getCollectionUnitProps = (collection_units?: ICollectionUnit[]): Record<string, string> => {
  const collectionUnitProps: Record<string, string> = {};
  (collection_units ?? []).forEach((unit) => {
    const key = headerToColumn(unit.category_name);
    collectionUnitProps[key] = unit.unit_name;
  });
  return collectionUnitProps;
};

// Common helper function to expose collectionUnitKeys
const getCollectionUnitKeys = (collection_units?: ICollectionUnit[]): string[] => {
  return Object.keys(getCollectionUnitProps(collection_units));
};

export {
  DayjsToPlain,
  nullToDayjs,
  nullOrDayjs,
  toPlainOnly,
  toClassOnly,
  createFlattenedProxy,
  getCollectionUnitProps,
  getCollectionUnitKeys
};
