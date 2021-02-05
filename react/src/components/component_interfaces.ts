import { StandardTextFieldProps } from '@material-ui/core';
import { IUpsertPayload } from 'api/api_interfaces';

/**
 * @param open displays or hides the modal
 * @param handleClose parent handler when modal is closed
 * @param title modal title string
 */
type ModalBaseProps = {
  open: boolean;
  handleClose?: (v: boolean) => void;
  title?: string;
};

/**
 * @param editing an instance of T
 * @param onSave parent save handler
 */
type EditModalBaseProps<T> = ModalBaseProps & {
  editing: T;
  onSave: (c: IUpsertPayload<T>) => void;
};

/**
 * @param editableProps props of T that will be displayed in the form
 * @param selectableProps props of T that will be displayed as select inputs
 * @param isEdit boolean representing whether the modal is adding a new T or editing
 */
type CritterCollarModalProps<T> = EditModalBaseProps<T> & {
  editableProps: string[];
  selectableProps: string[];
  isEdit?: boolean;
};

type ConfirmModalProps = ModalBaseProps & {
  btnNoText?: string;
  btnYesText?: string;
  message: string;
  handleClickYes: (v: any) => void;
};

type ExportImportProps = ModalBaseProps & {
  message?: string;
};

interface IInputProps {
  changeHandler: (o: Record<string, unknown>) => void;
}

/**
 * @param propName property name of T, used for label
 */
interface ITextfieldProps extends IInputProps, StandardTextFieldProps {
  propName: string;
}

interface INotificationMessage {
  message: string;
  type: 'error' | 'success' | 'none';
}

export type {
  CritterCollarModalProps,
  ModalBaseProps,
  ExportImportProps,
  EditModalBaseProps,
  IInputProps,
  ITextfieldProps,
  INotificationMessage,
  ConfirmModalProps
};
