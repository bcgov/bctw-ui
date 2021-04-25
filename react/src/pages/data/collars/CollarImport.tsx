import { Typography } from '@material-ui/core';
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
import { Collar, editableCollarProperties } from 'types/collar';
import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';
import bulkStyles from 'pages/data/bulk/bulk_styles';

type CollarImportProps = ModalBaseProps & {

};
export default function CollarImport({ open, handleClose }: CollarImportProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const styles = bulkStyles();
  const [importType, setImportType] = useState<'keyx' | 'csv' | 'template' | ''>('');
  const [message, setMessage] = useState<string>('');
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<IBulkUploadError[]>([]);

  // when successful posts are made to add new collars, refetch the collar page
  const invalidate = (): void => {
    queryClient.invalidateQueries('collartype');
  }

  const onSuccessKeyx = (response: IBulkUploadResults<Collar>): void => {
    if (response.errors.length) {
      setErrors(response.errors);
    } else {
      const newkeyx = response.results.map(r => r.device_id).join(', ');
      setMessage(`devices ${newkeyx} were successfully registered!`);
      invalidate();
    }
  };

  const onSuccessCsv = (response: IBulkUploadResults<Collar>): void => {
    if (response.errors.length) {
      setMessage(`a bulk upload completed but there were ${response.errors.length} error(s)`) ;
      setErrors(response.errors);
    } else {
      const newkeyx = response.results.map(r => r.device_id).join(', ');
      setMessage(`devices ${newkeyx} were successfully updated!`);
      invalidate();
    }
  };

  const onError = (e: AxiosError): void => {
    setMessage(e.message);
  };

  useEffect( () => {
    reset();
  }, [importType]);

  const reset = (): void => {
    resetCsv();
    resetKeyx();
    setMessage('');
    setErrors([]);
  }

  const onClose = (): void => {
    reset();
    handleClose(false);
  }

  // the bulk file handler mutation for importing .keyx files
  const { mutateAsync: mutateKeyx, reset: resetKeyx } = bctwApi.useMutateBulkXml({
    onSuccess: onSuccessKeyx, onError
  });

  // the single file mutation for importing a single .csv file with metadata
  const { mutateAsync: mutateCsv, reset: resetCsv } = bctwApi.useMutateBulkCsv({
    onSuccess: onSuccessCsv, onError
  });

  const onCsvFile = async (fieldName: string, files: FileList): Promise<void> => {
    const form = createFormData(fieldName, files);
    await mutateCsv(form);
  };

  const onKeyXFiles = async (name: string, files: FileList): Promise<void> => {
    const form = createFormData('xml', files);
    mutateKeyx(form);
  };

  const onDownloadTemplate = (): void => {
    download(editableCollarProperties.join(), FileStrings.collarTemplateName, '');
  }

  return (
    <Modal open={open} handleClose={onClose} title={'Device Import'}>
      <div>
        <Typography variant='h4'>{S.collarImportStartMsg}</Typography>
        <Typography variant={'h6'} onClick={(): void => setImportType('keyx')} className={'link link-hover'}>
          {S.collarImportKeyX}
        </Typography>
        <Typography variant={'h6'} onClick={(): void => setImportType('csv')} className={'link link-hover'}>
          {S.collarImportMetadata}
        </Typography>
        <Typography variant={'h6'} onClick={(): void => setImportType('template')} className={'link link-hover'}>
          {S.collarImportDowloadTemplate}
        </Typography>
        <div className={'import-btn'}>
          {importType === 'keyx' ? <FileInput accept='.keyx' buttonText='Upload KeyX file(s)' fileName={''} multiple={true} onFileChosen={onKeyXFiles} /> : null }
          {importType === 'csv' ? <FileInput accept='.csv' buttonText='Upload CSV file' onFileChosen={onCsvFile} /> : null }
          {importType === 'template' ? <Button color='secondary' onClick={onDownloadTemplate}>{FileStrings.templateButtonText}</Button> : null }
        </div>
        {message ? <hr></hr> : null}
        <div className={'response'}>{message}</div>
        {
          errors.map(e => {
            return (
              <div key={e.rownum}>
                <span className={styles.errRow}>Row {e.rownum}</span>
                <span className={styles.err}>{e.error}</span>
              </div>
            )
          })
        }
      </div>
    </Modal>
  );
}
