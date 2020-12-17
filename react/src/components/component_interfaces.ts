import { StandardTextFieldProps } from "@material-ui/core"

type ModalBaseProps = {
  open: boolean;
  handleClose: (v: boolean) => void;
  title?: string;
}

type ExportImportProps = ModalBaseProps & {
  handleToast?: (msg: string) => void;
  message?: string;
}

interface IInputProps {
  changeHandler: (o: object) => void;
}
interface ITextfieldProps extends IInputProps, StandardTextFieldProps {
  propName: string;
}

export type {
  ModalBaseProps,
  ExportImportProps,
  IInputProps,
  ITextfieldProps,
}