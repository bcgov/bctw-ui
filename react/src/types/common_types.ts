export type BCTW = {
  formatPropAsHeader?: (str: string) => string;
  identifier?: string; // used in tables to identify unique rows
}

export interface BCTWBaseType {
  created_at?: Date;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
  valid_from: Date;
  valid_to: Date;
}

/**
 * defines the main object types that have metadata in BCTW
 */
export type BCTWType = 'animal' | 'device'

/**
 * 
 */
export type FormFieldObject = {
  prop: string;
  isCode?: boolean;
  isDate?: boolean;
  isBool?: boolean;
  required?: boolean;
  span?: boolean;
};