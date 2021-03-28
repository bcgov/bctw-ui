export enum eUDFType {
  critter_group = 'critter_group'
}

export interface IUDF {
  udf_id: number;
  user_id: number;
  type: eUDFType;
  key: string;
  value: string;
}