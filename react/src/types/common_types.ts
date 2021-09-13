import dayjs, { Dayjs } from 'dayjs';

export interface BCTWValidDates {
  valid_from: Date | Dayjs;
  valid_to: Date | Dayjs; // a null value in this column indicates the 'current' record
}

// most database tables contain these columns for transactional history
export interface BaseTimestamps extends PartialPick<BCTWValidDates, 'valid_from' | 'valid_to'> {
  created_at?: Date;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
}
// todo: re-add tojson?
export interface BCTWBaseType<T> extends BaseTimestamps {
  owned_by_user_id?: boolean; // base types may include this

  formatPropAsHeader(k: keyof T): string;
  get displayProps(): (keyof T)[];
  get identifier(): string;
}

/**
 * similar to the @type {Code}, currently just a string alias
 */
export type uuid = string;

/**
 * almost any BCTW class that is displayed on in a data table or sent to the API is derived
 * from this base class
 */
export abstract class BCTWBase {
  error: boolean;
  // formats a class property as a table header cell or label
  abstract formatPropAsHeader(k: keyof BCTWBase): string;
  /**
   * optionally called before posting to API
   * ex. to remove unwanted properties that should not be preserved
   */
  abstract toJSON(): BCTWBase;
  /**
   * used in tables to identify unique rows
   * seen in classes that use class-transformer to convert JSON
   * from the API into an instance of class T
   */
  abstract get identifier(): string;
}

/**
 * defines the main object types that have metadata in BCTW
 */
export type BCTWType = 'animal' | 'device';

/**
 * extend a type, optionally including props
 */
export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P];
};

/**
 * used with transforming types from the API
 * generally only care about object received from API -> instance of UI class
 * ex. nulls can be transformed to a boolean or number
 */
const transformOpt = { toClassOnly: true };
const nullToNumber = (v: number | null): number => (typeof v === 'number' ? v : -1);
const nullToDayjs = (v: Date | null): Dayjs => dayjs(v);

export { nullToDayjs, nullToNumber, transformOpt };
