import { Button, CircularProgress, FormControlLabel, Radio, RadioGroup, Typography } from '@material-ui/core';
import { createFormData } from 'api/api_helpers';
import { IBulkUploadResults } from 'api/api_interfaces';
import { NotificationMessage } from 'components/common';
import FileInput from 'components/form/FileInput';
import { useState } from 'react';
import BasicTable from 'components/table/BasicTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManageLayout from 'pages/layouts/ManageLayout';
import React from 'react';
import { formatAxiosError } from 'utils/common';
import useDidMountEffect from 'hooks/useDidMountEffect';
import {
  bothImportMessage,
  critterImportMessage,
  deviceImportMessage,
  pointImportMessage
} from 'constants/formatted_string_components';
import download from 'downloadjs';
import { FileStrings, ImportSteps } from 'constants/strings';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { HistoricalTelemetry, HistoricalTelemetryInput, isHistoricalTelemetry } from 'types/point_import';
import { classToPlain, plainToClass } from 'class-transformer';

enum eImportType {
  animal = 'animal',
  device = 'device',
  both = 'both',
  // code = 'code',
  point = 'point'
}

// rendered as the radio options
const radios = [
  { value: eImportType.animal, header: 'Animal Metadata' },
  { value: eImportType.device, header: 'Device Metadata' },
  { value: eImportType.both, header: 'Animal and Device Metadata' },
  { value: eImportType.point, header: 'Historical Telemetry' }
];

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import<T>(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const [importType, setImportType] = useState<eImportType>();
  const [message, setMessage] = useState<React.ReactNode | string>('');

  // change the import message displayed when user selects a radio option
  useDidMountEffect(() => {
    const update = (): void => {
      switch (importType) {
        case eImportType.animal:
          setMessage(critterImportMessage);
          return;
        case eImportType.device:
          setMessage(deviceImportMessage);
          return;
        case eImportType.both:
          setMessage(bothImportMessage);
          return;
        case eImportType.point:
          setMessage(pointImportMessage);
          return;
      }
    };
    update();
  }, [importType]);

  // handle a successful csv upload response
  const onSuccess = (data: IBulkUploadResults<T>): void => {
    responseDispatch({
      type: 'success',
      message: `a bulk upload was completed ${data.errors.length ? ', but there were errors.' : 'successfully.'}`
    });
  };

  // todo: handle a failed csv upload response
  const onError = (): void => {};

  /**
   * while the response may have returned successfully, often the import will have failed
   * in this case @type {IBulkUploadResults} will contain an error array
   */
  const didImportHaveErrors = (): boolean => isSuccess && data.errors.length > 0;

  // setup the import mutation
  const { mutateAsync, isIdle, isLoading, isSuccess, isError, error, data, reset } = bctwApi.useMutateBulkCsv({
    onSuccess,
    onError
  });

  /**
   * based on the import type selected, download a template CSV file
   */
  const downloadTemplate = (): void => {
    let downloadStr = '';
    let templateName = '';
    switch (importType) {
      case eImportType.animal:
        downloadStr = Object.keys(new Animal()).join();
        templateName = FileStrings.animalTemplateName;
        break;
      case eImportType.device:
        downloadStr = Object.keys(new Collar()).join();
        templateName = FileStrings.collarTemplateName;
        break;
      case eImportType.point:
        downloadStr = Object.keys(new HistoricalTelemetryInput()).join();
        templateName = FileStrings.pointTemplateName;
        break;
      case eImportType.both:
        downloadStr = [...Object.keys(new Animal()), ...Object.keys(new Collar())].join();
        templateName = FileStrings.bothTemplateName;
    }
    if (downloadStr && templateName) {
      download(downloadStr, templateName);
    } else {
      responseDispatch({ type: 'error', message: `unable to download ${importType} template` });
    }
  };

  const handleFileChange = (fieldName: string, files: FileList): void => {
    save(createFormData(fieldName, files));
  };

  // call the save mutation with the For
  const save = async (form: FormData): Promise<any> => await mutateAsync(form);

  // the radio button handler
  const changeImportType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value as eImportType;
    setImportType(val);
  };

  // renders the result/error table when the API returs result of the import
  const renderResults = (data: IBulkUploadResults<T>): React.ReactNode => {
    const { errors, results } = data;
    const toShow = [];
    const isErrors = !!errors.length;
    let tableProps;
    if (isErrors) {
      tableProps = { headers: ['rownum', 'error'], rowIdentifier: 'rownum'};
    } else {
      let rowID = 'device_id'; 
      results.forEach((r) => {
        if (isHistoricalTelemetry(r)) {
          toShow.push(plainToClass(HistoricalTelemetry, r))
        } else if ((r as unknown as Animal).critter_id) {
          toShow.push(plainToClass(Animal, r));
          rowID = 'critter_id';
        } else if ((r as unknown as Collar).collar_id) {
          toShow.push(plainToClass(Collar, r));
        }
      })
      tableProps = { rowIdentifier: rowID };
    }
    return (
      <>
        <div style={{ marginBottom: '10px' }}>
          <NotificationMessage
            type={isError ? 'error' : 'success'}
            message={
              isError ? 'There were errors during the import' : `${results.length} record(s) were imported successfully.`
            }
          />
        </div>
        <BasicTable data={isError ? errors : classToPlain(toShow) as T[]} {...tableProps} />
      </>
    );
  };

  return (
    <ManageLayout>
      <div className='container'>
        {/* save progress indicator */}
        {isLoading ? (
          <div>
            saving...
            <CircularProgress />
          </div>
        ) : null}
        <h2>Bulk Import Data</h2>
        {/* import type options and instructions */}
        <div className={'import-setup'}>
          <div className={'import-choice'}>
            <Typography variant='h5'>{'What do you want to import?'}</Typography>
            <RadioGroup aria-label='position' name='import-type' value={importType} onChange={changeImportType}>
              {radios.map((r) => (
                <FormControlLabel
                  value={r.value}
                  control={<Radio color='primary' />}
                  label={r.header}
                  labelPlacement='end'
                />
              ))}
            </RadioGroup>
          </div>
          <div className={'import-steps'}>
            <Typography variant='h5'>{'Import Instructions'}</Typography>
            <ol>
              {ImportSteps.map((step, index) => {
                {/* render the download template button */}
                if (index === 0 && importType) {
                  return (
                    <li onClick={downloadTemplate} className={'cell-hover clickable-cell'}>
                      {step}
                    </li>
                  );
                }
                return <li>{step}</li>
              })}
            </ol>
          </div>
        </div> {/* import-setup */}

        {/* upload/try again button */}
        {isSuccess || isError ? (
          <Button style={{maxWidth: '150px'}} variant='contained' color='primary' onClick={reset}>{`${
            didImportHaveErrors() ? 'Try' : 'Upload'
          } Again`}</Button>
        ) : null}
        {isIdle ? <FileInput accept='.csv' disabled={!importType} onFileChosen={handleFileChange} /> : null}

        {/* import type-specific message */}
        <Typography style={{ minHeight: '200px', margin: '10px 0'}}>{message ?? ''}</Typography>

        {/* import results table */}
        <div style={{ minHeight: '200px', maxWidth: '80%', margin: '10px 0', overflowY: 'auto', overflowX: 'auto'}}>{isSuccess ? renderResults(data) : null}</div>

        {isError ? <NotificationMessage type='error' message={formatAxiosError(error)} /> : null}
      </div>
    </ManageLayout>
  );
}
