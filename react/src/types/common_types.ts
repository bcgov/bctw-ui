export type BCTW = {
  formatPropAsHeader?: (str: string) => string;
  identifier?: string; // used in tables to identify unique rows
}

export interface BctwBaseType {
  created_at?: Date;
  created_by_user_id?: number;
  updated_at?: Date;
  updated_by_user_id?: number;
  valid_from: Date;
  valid_to: Date;
}