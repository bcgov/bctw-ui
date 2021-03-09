import { SelectProps } from "@material-ui/core";

type ISelectProps = SelectProps & {
  codeHeader: string; // code header type to retrieve
  defaultValue: string;
  labelTitle: string;
  changeHandler: (o: Record<string, unknown>, isChange: boolean ) => void;
  changeHanderMultiple?: (o: Record<string, unknown>[], isChange: boolean) => void;
};

export type {
  ISelectProps
}