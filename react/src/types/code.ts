import { BCTW, BctwBaseType } from "./common_types";
import { Type } from 'class-transformer';
import { columnToHeader } from "utils/common";

/// represents a code and code header coming from backend
interface ICode {
  id: number;
  code: string;
  description: string;
}

// interface ICodeInput { }

interface ICodeHeader {
  id: number;
  type: string
  title: string;
  description: string;
}

export class CodeHeader implements BCTW, BctwBaseType {
  code_category_id: number;
  code_header_name: string;
  code_header_title: string;
  code_header_description: string;
  @Type(() => Date)valid_from: Date;
  @Type(() => Date)valid_to: Date;

  constructor() {
    this.code_category_id = 1; // default to bctw code category
    this.code_header_name = '';
    this.code_header_title = '';
    this.code_header_description = '';
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      default:
        return columnToHeader(str);
    }
  }
}

export type {
  ICode,
  ICodeHeader,
};
