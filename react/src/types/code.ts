/// represents a code and code header coming from backend
interface ICode {
  id: number;
  code: string;
  description: string;
}

interface ICodeHeader extends ICode {
  id: number;
  type: string
  title: string;
  description: string;
}

export type {
  ICode,
  ICodeHeader,
};
