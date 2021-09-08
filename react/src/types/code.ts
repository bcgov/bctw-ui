import { BCTWBase, BCTWBaseType } from './common_types';
import { Type } from 'class-transformer';
import { columnToHeader } from 'utils/common_helpers';
import { eInputType, FormFieldObject } from './form_types';

// just an string alias, but makes it clearer in other types when a value is a code
type Code = string;

// used in select multiple component 
interface ICodeFilter {
  code_header: string;
  code_header_title: string;
  description: string | number;
  code: string;
  id: number;
}

// used in MapDetails to "group" filters
// only uses description right now since map data is from views
interface IGroupedCodeFilter {
  code_header: string;
  descriptions: string[];
  // codes: string[];
  // ids: number[];
}

/// represents a code and code header coming from backend
interface ICode {
  id: number;
  code: string;
  description: string;
  long_description?: string;
  code_header_title?: string;
}

// interface ICodeInput { }

interface ICodeHeader {
  id: number;
  type: string
  title: string;
  description: string;
}

// represents the objects retrieved from the database
export class CodeHeader extends BCTWBase implements ICodeHeader {
  id: number;
  type: string
  title: string;
  description: string;

  toJSON(): CodeHeader { return this }

  get identifier(): keyof CodeHeader { return 'id' }

  formatPropAsHeader(str: string): string {
    return columnToHeader(str);
  }
}

// represents what a code header should look like when sending to api
export class CodeHeaderInput extends BCTWBase implements  BCTWBaseType {
  code_category_id: number;
  code_header_name: string;
  code_header_title: string;
  code_header_description: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;
  get identifier(): keyof CodeHeaderInput {
    return 'code_header_name';
  }

  constructor() {
    super();
    this.code_category_id = 1; // the bctw code category
    this.code_header_name = '';
    this.code_header_title = '';
    this.code_header_description = '';
  }

  toJSON(): CodeHeaderInput {
    return this;
  }

  formatPropAsHeader(str: string): string {
    // remove the prepended 'code_' part of the string
    const trimCode = str.slice(str.indexOf('_') + 1);
    return columnToHeader(trimCode);
  }
}

export const CodeFormFields: FormFieldObject<CodeHeaderInput>[] = [
  { prop: 'code_header_name', type: eInputType.text },
  { prop: 'code_header_title', type: eInputType.text },
  { prop: 'code_header_description', type: eInputType.text },
];

export type {
  ICode,
  ICodeFilter,
  IGroupedCodeFilter,
  ICodeHeader,
  Code,
};
