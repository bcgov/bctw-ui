/// represents a code and code header coming from backend
interface ICode {
  id: number;
  type: string;
  description: string;
}

interface ICodeHeader extends ICode {
  title: string;
}

export {
  ICode,
  ICodeHeader,
};
