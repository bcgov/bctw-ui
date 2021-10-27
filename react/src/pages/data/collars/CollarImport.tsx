import { CircularProgress, Typography } from '@mui/material';
import { CollarStrings as S, FileStrings } from 'constants/strings';
import download from 'downloadjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, useEffect } from 'react';
import FileInput from 'components/form/FileInput';
import { createFormData } from 'api/api_helpers';
import Modal from 'components/modal/Modal';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { IBulkUploadError, IBulkUploadResults } from 'api/api_interfaces';
import { Collar, IVectronicUpsert } from 'types/collar';
import { AxiosError } from 'axios';
import bulkStyles from 'pages/data/bulk/bulk_styles';

export default function CollarImport({ open, handleClose }: ModalBaseProps): JSX.Element {
  const api = useTelemetryApi();
  const styles = bulkStyles();
  const [importType, setImportType] = useState<'keyx' | 'csv' | 'template' | ''>('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<IBulkUploadError[]>([]);

  const onSuccessKeyx = (response: IBulkUploadResults<IVectronicUpsert>): void => {
    const { errors, results } = response;
    if (errors.length) {
      setErrors(response.errors);
    }
    if (results.length) {
      const newkeyx = results.map((r) => r.idcollar).join(', ');
      setMessage(`Vectronic devices ${newkeyx} were successfully registered!`);
    }
  };

  const onSuccessCsv = (response: IBulkUploadResults<Collar>): void => {
    if (response.errors.length) {
      setMessage(`a bulk upload completed but there were ${response.errors.length} error(s)`);
      setErrors(response.errors);
    } else {
      const devices = response.results.map((r) => r.device_id).join(', ');
      setMessage(`devices ${devices} ${devices?.length > 1 ? 'were' : 'was'} successfully updated!`);
    }
  };

  const onError = (e: AxiosError): void => {
    setMessage(e.message);
  };

  useEffect(() => {
    reset();
  }, [importType]);

  const reset = (): void => {
    resetCsv();
    resetKeyx();
    setMessage('');
    setErrors([]);
  };

  const onClose = (): void => {
    reset();
    handleClose(false);
  };

  // the bulk file handler mutation for importing .keyx files
  const { mutateAsync: mutateKeyx, reset: resetKeyx, isLoading: isPostingKeyx } = api.useUploadXML({
    onSuccess: onSuccessKeyx,
    onError
  });

  // the single file mutation for importing a single .csv file with metadata
  const { mutateAsync: mutateCsv, reset: resetCsv, isLoading: isPostingCsv } = api.useUploadCSV({
    onSuccess: onSuccessCsv,
    onError
  });

  const onCsvFile = async (fieldName: string, files: FileList): Promise<void> => {
    reset();
    const form = createFormData(fieldName, files);
    await mutateCsv(form);
  };

  const onKeyXFiles = async (name: string, files: FileList): Promise<void> => {
    reset();
    const form = createFormData('xml', files);
    mutateKeyx(form);
  };

  const onDownloadTemplate = (): void => {
    const headers = Collar.toCSVHeaderTemplate;
    download(headers.join(), FileStrings.collarTemplateName, '');
  };

  return (
    <Modal open={open} handleClose={onClose} title={S.collarImportStartMsg}>
      <div>
        <Typography variant={'h6'} onClick={(): void => setImportType('keyx')} className={'link link-hover'}>
          {S.collarImportKeyX}
        </Typography>
        <Typography variant={'h6'} onClick={(): void => setImportType('csv')} className={'link link-hover'}>
          {S.collarImportMetadata}
        </Typography>
        <Typography variant={'h6'} onClick={(): void => setImportType('template')} className={'link link-hover'}>
          {S.collarImportDowloadTemplate}
        </Typography>
        {/* show progress if waiting on API result */}
        {isPostingKeyx || isPostingCsv ? (
          <CircularProgress />
        ) : (
          <div className={'import-btn'}>
            {importType === 'keyx' ? (
              <FileInput
                accept='.keyx'
                buttonText={S.keyxButtonText}
                fileName={''}
                multiple={true}
                onFileChosen={onKeyXFiles}
              />
            ) : null}
            {importType === 'csv' ? (
              <FileInput accept='.csv' buttonText={S.csvButtonText} onFileChosen={onCsvFile} />
            ) : null}
            {importType === 'template' ? (
              <Button color='secondary' onClick={onDownloadTemplate}>
                {FileStrings.templateButtonText}
              </Button>
            ) : null}
          </div>
        )}
        {message ? <hr></hr> : null}
        <div className={'response'}>{message}</div>
        {errors.map((e) => {
          return (
            <div key={e.rownum}>
              {importType === 'csv' ? (<span className={styles.errRow}>Row {e.rownum}</span>) : null}
              <span className={styles.err}>{e.error}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
