import { StandardTextFieldProps } from "@material-ui/core"
import { IUpsertPayload } from "api/api_interfaces";

type ModalBaseProps = {
  open: boolean;
  handleClose?: (v: boolean) => void;
  title?: string;
}

type EditModalBaseProps<T> = ModalBaseProps & {
  editing: T;
  onSave: (c: IUpsertPayload<T>) => void;
}

type CritterCollarModalProps<T> = EditModalBaseProps<T> & {
  editableProps: string[];
  selectableProps: string[];
  isEdit?: boolean;
}

type ConfirmModalProps = ModalBaseProps & {
  btnNoText?: string;
  btnYesText?: string;
  message: string;
  handleClickYes: (v: any) => void;
};

type ExportImportProps = ModalBaseProps & {
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
  ConfirmModalProps,
}