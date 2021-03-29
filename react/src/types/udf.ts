export enum eUDFType {
  critter_group = 'critter_group'
}

export interface IUDFValue {
  key: string; 
  type: eUDFType;
  value: unknown; 
}

export interface IUDF {
  udf_id: number;
  user_id: number;
  type: eUDFType;
  key: string;
  value: IUDFValue[];
}
