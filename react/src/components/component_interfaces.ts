import { DialogProps } from '@material-ui/core';
import { IUpsertPayload } from 'api/api_interfaces';

/**
 * all modals and dialogs require these props
 * @param open displays or hides the modal
 * @param handleClose parent handler when modal is closed
 * @param title modal title string
*/
type ModalBaseProps = Pick<DialogProps, 'disableBackdropClick'> & {
  open: boolean;
  handleClose: (v: boolean) => void;
  title?: string;
};

/**
 * all modals must have a child component to render
*/
type ModalProps = ModalBaseProps & {
  children: React.ReactNode;
}

/**
 * the base props for the EditModal component
 * @param editing an instance of T
 * @param onSave parent save handler
*/
type EditModalBaseProps<T> = ModalBaseProps & {
  editing: T;
  onSave: (c: IUpsertPayload<T>) => void;
};

/**
 * props specific to the major BCTW type edit forms
 * @param isCreatingNew boolean representing whether the modal is creating or editing T
 * @param validateFailed a function handled in the ModifyWrapper that can display notifications
*/
type CritterCollarModalProps<T> = EditModalBaseProps<T> & {
  isCreatingNew?: boolean;
  validateFailed?: (errors: Record<string, unknown>) => void;
};


/**
 * props specific to the data management Export modals
 */
type ExportImportProps = ModalBaseProps & {
  message?: string | React.ReactNode;
  downloadTemplate?: () => void;
};

/**
 * handlers for form components
 */
type InputChangeHandler = (o: Record<string, string | number | boolean>) => void;
type CheckBoxChangeHandler = (o: Record<string, boolean>) => void;

/**
 * interface for the Notifaction component
 * ex. many components on successful/failed API responses will 
 * pass this type to the ApiResponseContext to show the result
 */
interface INotificationMessage {
  message: string;
  type: 'error' | 'success' | 'none';
}

export type {
  CritterCollarModalProps,
  ModalProps,
  ModalBaseProps,
  ExportImportProps,
  EditModalBaseProps,
  INotificationMessage,
  CheckBoxChangeHandler,
  InputChangeHandler,
};