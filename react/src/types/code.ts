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

// interface ICodeHeaderInput { }

export type {
  ICode,
  ICodeHeader,
};