import { Button, CircularProgress, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { createFormData } from 'api/api_helpers';
import { NotificationMessage } from 'components/common';
import FileInput from 'components/form/FileInput';
import { useState } from 'react';
import BasicTable from 'components/table/BasicTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import React from 'react';
import { formatAxiosError } from 'utils/errors';
import useDidMountEffect from 'hooks/useDidMountEffect';
import {
  bothImportMessage,
  critterImportMessage,
  deviceImportMessage,
} from 'constants/formatted_string_components';
import download from 'downloadjs';
import { FileStrings, ImportSteps } from 'constants/strings';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { plainToClass } from 'class-transformer';
import { IBulkUploadResults } from 'api/api_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';

enum eImportType {
  animal = 'animal',
  device = 'device',
  both = 'both',
}

// rendered as the radio options
const radios = [
  { value: eImportType.animal, header: 'Animal Metadata' },
  { value: eImportType.device, header: 'Device Metadata' },
  { value: eImportType.both, header: 'Animal and Device Metadata' }
];

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [importType, setImportType] = useState<eImportType | null>(null);
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
      }
    };
    update();
  }, [importType]);

  // handle a successful csv upload response
  const onSuccess = (d: IBulkUploadResults<unknown>): void => {
    // console.log('csv upload results:', d);
    if (d.errors.length) {
      onError()
    } else {
      showNotif({severity: 'success', message: `a bulk upload was completed successfully`});
    }
  };

  const onError = (): void => {
    showNotif({ severity: 'error', message: 'bulk upload failed' });
  };

  // setup the import mutation
  const { mutateAsync, isIdle, isLoading, isSuccess, isError, error, data, reset } = api.useUploadCSV({ onSuccess, onError });

  // download a template CSV file based on the import type selected, 
  const downloadTemplate = (): void => {
    switch (importType) {
      case eImportType.animal:
        download(Animal.toCSVHeaderTemplate.join(), FileStrings.animalTemplateName);
        break;
      case eImportType.device:
        download(Collar.toCSVHeaderTemplate.join(), FileStrings.collarTemplateName);
        break;
      case eImportType.both:
      default:
        download([...Animal.toCSVHeaderTemplate, ...Collar.toCSVHeaderTemplate].join(),  FileStrings.bothTemplateName);
    }
  };

  const handleFileChange = (fieldName: string, files: FileList): void => {
    save(createFormData(fieldName, files));
  };

  // call the save mutation
  const save = async (form: FormData): Promise<IBulkUploadResults<unknown>> => await mutateAsync(form);

  // the radio button handler
  const changeImportType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value as eImportType;
    setImportType(val);
  };

  // renders the result/error table when the API returs result of the import
  const Results = (): JSX.Element => {
    if (isError) {
      return <>error</>;
    }
    if (isIdle || !data) {
      return null;
    }
    const { errors, results } = data;
    const toShow = [];
    const isErrors = !!errors.length;
    if (isErrors) {
      return <BasicTable data={errors as any} rowIdentifier='rownum' headers={['rownum', 'error'] as any} />;
    } else {
      results.forEach((r) => {
        if ((r as unknown as Animal).critter_id) {
          toShow.push(plainToClass(Animal, r));
        } else if ((r as unknown as Collar).collar_id) {
          toShow.push(plainToClass(Collar, r));
        }
      });
    }
    return <BasicTable data={toShow} headers={Object.keys(toShow[0])} rowIdentifier={'id'} />;
  };

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Data Import</h1>
        <Typography mb={3} variant='body1' component='p'>Import metadata via CSV file.</Typography>
        {/* save progress indicator */}
        {isLoading ? <div>saving...<CircularProgress /></div> : null}
        {/* import type options and instructions */}
        <div className={'import-setup'}>
          <div className={'import-choice'}>
            <Typography variant='h5'>{'What do you want to import?'}</Typography>
            <RadioGroup aria-label='position' value={importType} onChange={changeImportType}>
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
                if (index === 1 && importType) {
                  return <li onClick={downloadTemplate} className={'cell-clickable'}>{step}</li>;
                }
                return <li>{step}</li>;
              })}
            </ol>
          </div>
        </div>{' '}
        {/* import-setup */}
        {/* upload/try again button */}
        {isSuccess || isError ? (
          <Button color='primary' variant='contained' onClick={reset}>Upload Again</Button>
        ) : null}
        {isIdle ? <FileInput accept='.csv' disabled={!importType} onFileChosen={handleFileChange} /> : null}
        {/* import type-specific message */}
        <Typography style={{ minHeight: '200px', margin: '10px 0' }}>{message ?? ''}</Typography>
        {/* import results table */}
        <div style={{ minHeight: '200px', maxWidth: '80%', margin: '10px 0', overflowY: 'auto', overflowX: 'auto' }}>
          <Results />
        </div>
        {isError ? <NotificationMessage severity='error' message={formatAxiosError(error)} /> : null}
      </div>
    </AuthLayout>
  );
}
