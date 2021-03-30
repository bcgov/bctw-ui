export enum eUDFType {
  critter_group = 'critter_group'
}

// what the backend expects to receive
export interface IUDFInput {
  type: eUDFType;
  key: string;
  value: string[];
}

// what the frontend receives
export interface IUDF extends IUDFInput {
  udf_id: number;
  user_id: number;
  changed?: boolean;
}
