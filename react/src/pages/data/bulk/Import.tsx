import React from 'react';
import Modal from 'components/modal/Modal';
import { Typography } from '@material-ui/core';
import { ExportImportProps } from 'components/component_interfaces';
import FileInput from 'components/form/FileInput';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { ErrorMessage, SuccessMessage } from 'components/common';
import { IBulkUploadResults } from 'api/api_interfaces';
import Button from 'components/form/Button';
import bulkStyles from './bulk_styles';

/* todo: 
  force refetch or set cache of T on successful mutation
  copyrow?
*/

/**
 * 
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import<T>(props: ExportImportProps) {
  const styles = bulkStyles();
  const bctwApi = useTelemetryApi();

  const handleSucess = (data: IBulkUploadResults<T>) => {
    const toast = props.handleToast;
    if (toast && typeof toast === 'function') {
      const msg = `a bulk upload was completed ${data.errors.length ? ', but there were errors.' : 'successfully.'}`
      toast(msg)
    }
  }

  const [mutate, { isIdle, isLoading, isSuccess, isError, error, data, reset }] = useMutation<IBulkUploadResults<T>, AxiosError>(bctwApi.uploadCsv, { onSuccess: handleSucess },);

  const handleFileChange = (fieldName: string, files: FileList) => {
    const formData = new FormData();
    if (!files.length) return;
    Array
      .from(Array(files.length).keys())
      .map(i => formData.append(fieldName, files[i], files[i].name))
    save(formData);
  }

  const save = async (form: FormData) => await mutate(form as any);

  const copy = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, row: T) => {
    event.preventDefault();
    // console.log(row);
  }

  const onClose = () => {
    reset();
    props.handleClose(false);
  }

  const hasErrors = (): boolean => isSuccess && data.errors.length > 0;

  const handleResults = (data: IBulkUploadResults<T>): React.ReactNode => {
    const { errors, results } = data;
    if (errors.length) {
      return <>
        {
          errors.map(e => {
            return (
              <div key={e.rownum}>
                <span className={styles.errRow}>Row {e.rownum}</span>
                <span className={styles.err}>{e.error}</span>
                <a className={styles.errRow} href='/#' onClick={(event) => copy(event, e.row)}>Copy Row</a>
              </div>
            )
          })
        }
      </>
    }
    const numSuccessful = results.length
    const msg = `${numSuccessful} item${numSuccessful > 1 ? 's' : ''} ${numSuccessful > 1 ? 'were ' : 'was successfully imported'}`;
    return <SuccessMessage message={msg}></SuccessMessage>
  }

  return (
    <>
      <Modal {...props} handleClose={onClose}>
        {isLoading ? <div>saving...</div> : null}
        {isError ? <ErrorMessage message={error?.response?.data ?? error.message} /> : null}
        {isSuccess ? handleResults(data) : null}
        {
          isIdle ?
            <>
              <Typography>{props.message ?? ''}</Typography>
              <Typography>Make sure the first row matches the specified headers exactly.</Typography>
            </>
            : null
        }
        <div className={styles.footer}>
          {isIdle ? <FileInput onFileChosen={handleFileChange} /> : null}
          {isSuccess || isError ? <Button variant='contained' component='span' onClick={reset}>{`${hasErrors() ? 'try' : 'upload'} again`}</Button> : null}
        </div>
      </Modal>
    </>
  )
}