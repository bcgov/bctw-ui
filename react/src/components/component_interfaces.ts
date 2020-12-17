type ModalBaseProps = {
  open: boolean;
  handleClose: (v: boolean) => void;
  title?: string;
}

type ExportImportProps = ModalBaseProps & {
  handleToast?: (msg: string) => void;
  message?: string;
}

export type {
  ModalBaseProps,
  ExportImportProps,
}