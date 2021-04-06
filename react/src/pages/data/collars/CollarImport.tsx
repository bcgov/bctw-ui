import { Typography } from '@material-ui/core';
import { CollarStrings as S } from 'constants/strings';
// import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, useEffect } from 'react';
import FileInput from 'components/form/FileInput';
import { createFormData } from 'api/api_helpers';
import Modal from 'components/modal/Modal';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { IBulkUploadResults } from 'api/api_interfaces';
import { Collar } from 'types/collar';
import { AxiosError } from 'axios';

type CollarImportProps = ModalBaseProps & {

};
export default function CollarImport({ open, handleClose }: CollarImportProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  // const responseDispatch = useResponseDispatch();
  const [importType, setImportType] = useState<'keyx' | 'csv' | 'template' | ''>('');
  const [message, setMessage] = useState<string>('');

  const onSuccessKeyx = (response: IBulkUploadResults<Collar>): void => {
    if (response.errors.length) {
      setMessage(response.errors.map(e => e.error).join('\n'));
    } else {
      const newkeyx = response.results.map(r => r.device_id).join(', ');
      setMessage(`devices ${newkeyx} were successfully registered!`);
    }
  };

  const onSuccessCsv = (response: IBulkUploadResults<Collar>): void => {
    if (response.errors.length) {
      setMessage(`a bulk csv upload completed but there were ${response.errors.length} errors`) ;
    } else {
      const newkeyx = response.results.map(r => r.device_id).join(', ');
      setMessage(`devices ${newkeyx} were successfully updated!`);
    }
  };

  const onError = (e: AxiosError): void => {
    setMessage(e.message);
  };

  useEffect( () => {
    if (importType === 'csv' || importType === 'keyx') {
      reset();
    } 
  }, [importType]);

  const reset = (): void => {
    resetCsv();
    resetKeyx();
    setMessage('')
  }

  // the bulk file handler mutation for importing .keyx files
  const { mutateAsync: mutateKeyx, reset: resetKeyx } = bctwApi.useMutateBulkFiles({
    onSuccess: onSuccessKeyx, onError
  });

  // the single file mutation for importing a single .csv file with metadata
  const { mutateAsync: mutateCsv, reset: resetCsv } = bctwApi.useMutateBulkCsv({
    onSuccess: onSuccessCsv, onError
  });

  const onCsvFile = async (fieldName: string, files: FileList): Promise<void> => {
    await mutateCsv(createFormData(fieldName, files));
  };

  const onKeyXFiles = async (name: string, files: FileList): Promise<void> => {
    mutateKeyx(createFormData('xml', files));
  };

  const onDownloadTemplate = () => {
    // todo:
  }

  return (
    <Modal open={open} handleClose={handleClose} title={'Device Import'}>
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
          {importType === 'keyx' ? <FileInput buttonText='Upload keyx file(s)' fileName={''} multiple={true} onFileChosen={onKeyXFiles} /> : null }
          {importType === 'csv' ? <FileInput buttonText='Upload csv file' onFileChosen={onCsvFile} /> : null }
          {importType === 'template' ? <Button onClick={onDownloadTemplate}>Download csv template</Button> : null }
        </div>
        <hr></hr>
        <div className={'response'}>{message}</div>
      </div>
    </Modal>
  );
}
