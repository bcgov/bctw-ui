import { BCTW, BctwBaseType } from "./common_types";
import { Type } from 'class-transformer';
import { columnToHeader } from "utils/common";

// used in select multiple component 
interface ICodeFilter {
  code_header: string;
  code_header_title: string;
  description: string;
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
  long_description: string;
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
export class CodeHeader implements BCTW, ICodeHeader {
  id: number;
  type: string
  title: string;
  description: string;

  formatPropAsHeader(str: string): string {
    return columnToHeader(str);
  }
}

// represents what a code header should look like when sending to api
export class CodeHeaderInput implements BCTW, BctwBaseType {
  code_category_id: number;
  code_header_name: string;
  code_header_title: string;
  code_header_description: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;

  constructor() {
    this.code_category_id = 1; // the bctw code category
    this.code_header_name = '';
    this.code_header_title = '';
    this.code_header_description = '';
  }

  formatPropAsHeader(str: string): string {
    const trimCode = str.slice(str.indexOf('_') + 1);
    return columnToHeader(trimCode);
  }
}

export type {
  ICode,
  ICodeFilter,
  IGroupedCodeFilter,
  ICodeHeader,
};
