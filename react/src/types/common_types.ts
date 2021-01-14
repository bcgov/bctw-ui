
type BCTW = {
  formatPropAsHeader?: (str: string) => string;
}

export type {
  BCTW,
}
export interface BctwBaseType {
  created: Date;
  expire_date: Date;
  deleted: boolean;
  deleted_at: Date;
}