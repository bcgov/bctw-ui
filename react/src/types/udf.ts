import { columnToHeader } from 'utils/common_helpers';
import { ICodeFilter } from './code';
import { Expose } from 'class-transformer';
import { BCTWBase } from './common_types';

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

export class UDF extends BCTWBase implements IUDF {
  type: eUDFType;
  key: string;
  value: string[];
  udf_id: number;
  user_id: number;
  changed?: boolean;
  @Expose() get identifier(): string {
    return 'key';
  }
  formatPropAsHeader(str: string):string {
    return columnToHeader(str);
  }
  toJSON(): UDF {
    return this;
  }
}

/**
 * @returns UDFs transformed into normal @type {ICodeFilter}
 * which can be used in the map filter panel
*/
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

export { transformUdfToCodeFilter }