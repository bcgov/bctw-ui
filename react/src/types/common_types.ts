// BCTW metadata classes (ex. Animal, Collar) inherit this interface
export type BCTW = {
  // formats a class property as a table header cell or label
  formatPropAsHeader?: (str: string) => string;
  /**
   * some classes will use this before posting to API
   * ex. to remove unwanted properties that should not be preserved 
   */
  toJSON?: () => unknown;
  /**
   * used in tables to identify unique rows
   * seen in classes that use class-transformer to convert JSON
   * from the API into an instance of class T
   */
  identifier?: string; 
}

// most BCTW database tables contain these columns for transactional history
export interface BCTWBaseType {
  created_at?: Date;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
  valid_from: Date;
  valid_to: Date; // a null value in this column indicates the 'current' record
}

/**
 * defines the main object types that have metadata in BCTW
 */
export type BCTWType = 'animal' | 'device'
