// most BCTW database tables contain these columns for transactional history
export interface BCTWBaseType {
  created_at?: Date;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
  valid_from: Date;
  valid_to: Date; // a null value in this column indicates the 'current' record
  owned_by_user_id?: boolean; // base types may include this
}

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
export type BCTWType = 'animal' | 'device'

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
export const transformOpt = { toClassOnly: true };