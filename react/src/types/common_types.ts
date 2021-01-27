
export type BCTW = {
  formatPropAsHeader?: (str: string) => string;
}

export interface BctwBaseType {
  valid_from: Date;
  valid_to: Date;
  // created: Date;
  // expire_date: Date;
  // deleted: boolean;
  // deleted_at: Date;
}