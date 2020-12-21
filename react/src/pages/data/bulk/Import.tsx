import { Typography } from '@material-ui/core';
import { IBulkUploadResults } from 'api/api_interfaces';
import { NotificationMessage } from 'components/common';
import { ExportImportProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import FileInput from 'components/form/FileInput';
import Modal from 'components/modal/Modal';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React from 'react';
import { formatAxiosError, isValidToast } from 'utils/common';

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
    if (isValidToast(props.handleToast)) {
      props.handleToast(`a bulk upload was completed ${data.errors.length ? ', but there were errors.' : 'successfully.'}`)
    }
  }

  const [mutate, { isIdle, isLoading, isSuccess, isError, error, data, reset }] = bctwApi.useMutateBulkCsv({ onSuccess: handleSucess })

  const handleFileChange = (fieldName: string, files: FileList) => {
    const formData = new FormData();
    if (!files.length) return;
    Array
      .from(Array(files.length).keys())
      .map(i => formData.append(fieldName, files[i], files[i].name))
    save(formData);
  }

  const save = async (form: FormData) => await mutate(form);

  const copy = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, row: T) => {
    // todo:
    event.preventDefault();
  }

  const onClose = () => {
    reset();
    props.handleClose(false);
  }

  const importHadErrors = (): boolean => isSuccess && data.errors.length > 0;

  const renderResults = (data: IBulkUploadResults<T>): React.ReactNode => {
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
    const msg = `${numSuccessful} item${numSuccessful > 1 ? 's' : ''} ${numSuccessful > 1 ? 'were ' : 'was'} successfully imported`;
    return <NotificationMessage type='success' message={msg}/>
  }

  return (
    // <>
      <Modal {...props} handleClose={onClose}>
        {isLoading ? <div>saving...</div> : null}
        {isError ? <NotificationMessage type='error' message={formatAxiosError(error)} /> : null}
        {isSuccess ? renderResults(data) : null}
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
          {isSuccess || isError ? <Button variant='contained' component='span' onClick={reset}>{`${importHadErrors() ? 'try' : 'upload'} again`}</Button> : null}
        </div>
      </Modal>
    // </>
  )
}