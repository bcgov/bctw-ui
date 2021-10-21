import { columnToHeader } from 'utils/common_helpers';
import { ICodeFilter } from 'types/code';
import { BCTWBase } from 'types/common_types';

export enum eUDFType {
  critter_group = 'critter_group',
  collective_unit = 'collective_unit',
}

// what the backend expects to receive when saving UDFs
export interface IUDF {
  type: eUDFType;
  key: string;
  value: string[] | string;
  changed?: boolean;
}

export class UDF implements IUDF, BCTWBase<IUDF> {
  type: eUDFType;
  key: string;
  value: string[] | string;
  changed?: boolean;
  get identifier(): string {
    return 'key';
  }
  formatPropAsHeader(str: string):string {
    return columnToHeader(str);
  }
  get displayProps(): (keyof IUDF)[] {
    return [];
  }
  toJSON(): IUDF {
    const { key, type, value } = this;
    return { key, type, value }; 
  }

  constructor(udf_type: eUDFType) {
    this.key ='';
    this.value = [];
    this.changed = false;
    this.type = udf_type;
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
    const { value } = u;
    if (Array.isArray(value)) {
      allValues.push(...value);
    } else {
      allValues.push(value);
    }
  })
  // assuming each udf is of the same type
  return allValues.map(p => {
    return {code_header: prop, description: p, code: '', code_header_title: '', id: 0 };
  })
}

export { transformUdfToCodeFilter }