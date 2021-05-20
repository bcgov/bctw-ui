import { CircularProgress, Typography } from '@material-ui/core';
import { createFormData } from 'api/api_helpers';
import { IBulkUploadResults } from 'api/api_interfaces';
import { NotificationMessage } from 'components/common';
import { ExportImportProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import FileInput from 'components/form/FileInput';
import Modal from 'components/modal/Modal';
import BasicTable from 'components/table/BasicTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React from 'react';
import { formatAxiosError } from 'utils/common';

/* todo: 
  force refetch or set cache of T on successful mutation
  copyrow?
*/

/**
 *
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import<T>(props: ExportImportProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data: IBulkUploadResults<T>): void =>
    responseDispatch({
      type: 'success',
      message: `a bulk upload was completed ${data.errors.length ? ', but there were errors.' : 'successfully.'}`
    });

  const { mutateAsync, isIdle, isLoading, isSuccess, isError, error, data, reset } = bctwApi.useMutateBulkCsv({
    onSuccess
  });

  const handleFileChange = (fieldName: string, files: FileList): void => {
    save(createFormData(fieldName, files));
  };

  const save = async (form: FormData): Promise<any> => await mutateAsync(form);

  const copy = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, row: JSON): void => {
    // todo:
    event.preventDefault();
  };

  const onClose = (): void => {
    reset();
    props.handleClose(false);
  };

  const importHadErrors = (): boolean => isSuccess && data.errors.length > 0;

  const renderResults = (data: IBulkUploadResults<T>): React.ReactNode => {
    const { errors, results } = data;
    if (errors.length) {
      return (
        <BasicTable 
          headers={['rownum', 'error']}
          data={errors}
          rowIdentifier={'rownum'}
        />
      );
    }

    const numSuccessful = results.length;
    const msg = `${numSuccessful} item${numSuccessful > 1 ? 's' : ''} ${
      numSuccessful > 1 ? 'were ' : 'was'
    } successfully imported`;
    return <NotificationMessage type='success' message={msg} />;
  };

  return (
    <Modal {...props} handleClose={onClose}>
      {isLoading ? (<div>saving...<CircularProgress /></div>) : null}
      <Typography>{props.message ?? ''}</Typography>

      {/* the download template button */}
      {props.downloadTemplate ? (
        <div style={{marginBottom: '10px'}}>
          <p className={'map-details-cell-hover map-details-clickable-cell'} onClick={props.downloadTemplate}>
            Click here to download a template
          </p>
        </div>
      ) : null}

      {isSuccess ? renderResults(data) : null}

      {/* the the upload or try again button */}
      <div>
        {isSuccess || isError ? (
          <Button variant='contained' color='secondary' onClick={reset}>{`${
            importHadErrors() ? 'Try' : 'Upload'
          } Again`}</Button>
        ) : null}
        {isIdle ? <FileInput accept='.csv' onFileChosen={handleFileChange} /> : null}
      </div>

      {isError ? <NotificationMessage type='error' message={formatAxiosError(error)} /> : null}
    </Modal>
  );
}
