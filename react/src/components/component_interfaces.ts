import { StandardTextFieldProps } from "@material-ui/core"

type ModalBaseProps = {
  open: boolean;
  handleClose: (v: boolean) => void;
  title?: string;
}

type EditModalBaseProps<T> = ModalBaseProps & {
  editing: T;
  onSave: (c: T) => void;
  iMsg: INotificationMessage;
}

type CritterCollarModalProps<T> = EditModalBaseProps<T> & {
  editableProps: string[];
  selectableProps: string[];
  isEdit?: boolean;
  onPost: (s: string) => void;
}

type ExportImportProps = ModalBaseProps & {
  handleToast?: (msg: string) => void;
  message?: string;
}

interface IInputProps {
  changeHandler: (o: Record<string, unknown>) => void;
}
interface ITextfieldProps extends IInputProps, StandardTextFieldProps {
  propName: string;
}

interface INotificationMessage {
  message: string;
  type: 'error' | 'success' | 'none'
}

export type {
  CritterCollarModalProps,
  ModalBaseProps,
  ExportImportProps,
  EditModalBaseProps,
  IInputProps,
  ITextfieldProps,
  INotificationMessage,
}