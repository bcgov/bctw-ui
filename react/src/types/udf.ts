import { ICodeFilter } from "./code";

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

// transforms udfs into normal filters
const transformUdfToCodeFilter = (udfs: IUDF[], udfType: eUDFType): ICodeFilter[] => {
  let prop = '';
  switch(udfType) {
    case eUDFType.critter_group:
      prop = 'critter_id';
      break;
    default:
      break;
  }
  const allValues: string[] = [];
  // get all the 'values', in this case the list of critter ids from the udfs
  udfs.forEach(u => {
    allValues.push(...u.value);
  })
  // assuming each udf is of the same type
  return allValues.map(p => {
    return {code_header: prop, description: p, code: '', code_header_title: '', id: 0 };
  })
}

export {
  transformUdfToCodeFilter,
}