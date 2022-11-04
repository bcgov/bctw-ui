import { Box, Button, CircularProgress, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Typography } from '@mui/material';
import { createFormData } from 'api/api_helpers';
import { Icon, NotificationMessage } from 'components/common';
import FileInput from 'components/form/FileInput';
import { useEffect, useState } from 'react';
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
import { IBulkUploadResults, ParsedXLSXResult } from 'api/api_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';
import { Banner, ErrorBanner, NotificationBanner, SuccessBanner } from 'components/common/Banner';
import { SubHeader } from 'components/common/partials/SubHeader';
import HighlightTable from 'components/table/HighlightTable';
import makeStyles from '@mui/styles/makeStyles';

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

const useStyles = makeStyles((theme) => ({
  spacing: {
      marginTop: theme.spacing(2)
  },
  spacingTopBottom: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));


/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [importType, setImportType] = useState<eImportType | null>(null);
  const [message, setMessage] = useState<React.ReactNode | string>('');
  const [sanitizedImport, setSanitizedImport] = useState<ParsedXLSXResult[]>([]);
  const [canFinalize, setCanFinalize] = useState(false);
  const [fileName, setFilename] = useState('');
  const [selectedError, setSelectedError] = useState(null);
  const styles = useStyles();

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
  const oldonSuccess = (d: IBulkUploadResults<unknown>): void => {
    // console.log('csv upload results:', d);
    if (d.errors.length) {
      errorXLSX()
    } else {
      showNotif({severity: 'success', message: `a bulk upload was completed successfully`});
    }
  };

  useEffect(() => {
    if(!sanitizedImport || !sanitizedImport.length) {
      setCanFinalize(false);
      return;
    }

    if(sanitizedImport.every(o => o.success)) {
      setCanFinalize(true);
    }
    else {
      setCanFinalize(false);
    }


  }, [sanitizedImport]);


  const successXLSX = (d: ParsedXLSXResult[]) => {
    if(d.length) {
      setSanitizedImport(d);
    }
    else {
      showNotif({severity: 'error', message: 'The data sanitization process failed.'})
    }
    
  } 

  const errorXLSX = (): void => {
    showNotif({ severity: 'error', message: 'bulk upload failed' });
  };

  const successFinalize = (d: IBulkUploadResults<unknown>): void => {
    console.log(JSON.stringify(d, null, 2));
  }

  const errorFinalize = (): void => {
    showNotif({severity: 'error', message: 'An error was encountered when trying to finalize the data upload.'});
  }

  // setup the import mutation
  const { mutateAsync, isIdle, isLoading, isSuccess, isError, error, data, reset } = api.useUploadXLSX({ onSuccess: successXLSX, onError: errorXLSX });
  const { mutateAsync: mutateFinalize, data: dataFinalize } = api.useFinalizeXLSX({ onSuccess: successFinalize, onError: errorFinalize });

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
    setFilename(files[0]?.name);
  };

  // call the save mutation
  const save = async (form: FormData): Promise<ParsedXLSXResult[]> => await mutateAsync(form);

  // the radio button handler
  const changeImportType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value as eImportType;
    setImportType(val);
  };

  const collectErrorsFromResults = (results: ParsedXLSXResult[]): string[] => {
    const errArr = [];
    results.forEach((r,idx) => {
      errArr.push(...r.errors.map(e => {
        return e['identifier'] ?
        `At row index ${idx}, your animal does not meet the unique identification criteria for this species.`
        :
        `At row index ${idx}, cell "${Object.keys(e)[0]}": ${Object.values(e)[0]}`
    }));
    })
    return errArr;
  }

  // renders the result/error table when the API returs result of the import
  const Results = (): JSX.Element => {
    if (isError) {
      return <>error</>;
    }
    if (isIdle || !data) {
      return null;
    }
    if(data) {
      if(canFinalize) {
        return  ( 
        <Box>
          <Typography>Data has been verified and is ready for submission.</Typography>
          <Button onClick={() => {mutateFinalize(sanitizedImport)}} variant='contained'>Finalize Data Import</Button>
        </Box>
        );
      }
      else {
        console.log(JSON.stringify(data, null, 2));
        return (
        <>
        <Typography>This is where we would display a table with all your bad entries.</Typography>
        {data.forEach(arr => { return (<>{arr.errors.map(o => { return ( <><Typography>{JSON.stringify(o)}</Typography></>) } )}</>)})}
        </>
        );
      }
    }
    /*
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
    return <BasicTable data={toShow} headers={Object.keys(toShow[0])} rowIdentifier={'id'} />;*/
  };

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Data Import</h1>
        <Paper className={styles.spacing} style={{padding: '24px'}}>
          <Box display='flex'>
            <SubHeader text='Device Metadata'/>
            <Button style={{marginLeft: 'auto'}} variant='outlined'>Download Template</Button>
          </Box>
          <Box className={styles.spacing}>
            <Banner
              variant='info'
              text={['To add a new animal and collar, create a new row in the Device Metadata template and fill out the required fields.',
                    'Device IDs already assigned to an Animal ID must first be released by their owner before they can be assigned to a new Animal ID.']}  
            />
          </Box>
          <Paper elevation={3} className={styles.spacing} style={{padding: '16px', backgroundColor: 'text.secondary', display: 'flex', justifyContent: 'center'}}>
            {sanitizedImport.length > 0 ?
                (<>
                  <Typography>{fileName}</Typography>
                  <Icon htmlColor={canFinalize ? 'green' : 'red'} icon={canFinalize ? 'check' : 'error'}></Icon>
                  <IconButton style={{padding: '0px'}} onClick={() => {setSanitizedImport([])}}>
                    <Icon icon='delete'/>
                  </IconButton>
                </>)
                :
                (<FileInput buttonText='Upload Device Metadata Template' buttonVariant='text' accept='.xlsx' onFileChosen={handleFileChange} />)
            } 
          </Paper>
          
          {sanitizedImport.length > 0 && (
            <>
            <Typography className={styles.spacingTopBottom}>Upload Preview</Typography>
            {canFinalize ?
              (<SuccessBanner
                text={'Your spreadsheet appears to be correctly formatted. Please double check that the information displayed below is what you wish to submit.'}
              />)
              : 
              (<>
              <Banner
                variant='error'
                text={'Hover over highlighted cells to view error info. Fix these errors in your spreadsheet application and re-upload.'} 
                icon={<Icon icon='error'/>}
                action='collapse'
                hiddenContent={collectErrorsFromResults(sanitizedImport).map(a => <div>{a}</div>)} 
              />
              <Banner
              variant='error'
              text={selectedError ? `Selected error at row ${JSON.stringify(selectedError)}` : 'Click a cell for detailed information about that error.'}
              icon={<Icon icon='help'/>}
              />
              </>)
            }
            <HighlightTable
            data={sanitizedImport.map((o,idx) => {return {row_index: idx, ...o.row}}) as any[]}
            headers={['row_index', ...Object.keys(sanitizedImport[0].row) as any]}
            onSelectCell={(value, message) => setSelectedError(value)}
            messages={sanitizedImport.map(o => Object.assign({}, ...o.errors))} 
            rowIdentifier='row_index'
            />
            
            </>
          )}
          <Box display='flex'><Button disabled={!canFinalize} className={styles.spacing} variant='contained' style={{marginLeft: 'auto'}}>Finalize Submission</Button></Box>
        </Paper>
        <Paper className={styles.spacing} style={{padding: '24px'}}>
          <Box display='flex'>
            <SubHeader text='Telemetry Data'/>
            <Button style={{marginLeft: 'auto'}} variant='outlined'>Download Template</Button>
          </Box>
          <Box className={styles.spacing}>
            <Banner
              variant='info'
              text={['Telemetry placeholder text. ',
                    'Telemetry placeholder text.']}  
            />
          </Box>
          <Paper className={styles.spacing} style={{padding: '16px', backgroundColor: 'text.secondary', display: 'flex', justifyContent: 'center'}}>
            
          </Paper>
          <Box display='flex'>
            <Button disabled={!canFinalize} className={styles.spacing} variant='contained' style={{marginLeft: 'auto'}}>Finalize Submission</Button>
          </Box>
        </Paper>


        {/*
        <Typography mb={3} variant='body1' component='p'>Import metadata via CSV file.</Typography>
        {/* save progress indicator }
        {isLoading ? <div>saving...<CircularProgress /></div> : null}
        {/* import type options and instructions *}
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
        {/* import-setup}
        {/* upload/try again button}
        {(isSuccess || isError) && !canFinalize ? (
          <Button color='primary' variant='contained' onClick={reset}>Upload Again</Button>
        ) : null}
        {isIdle ? <FileInput accept='.csv' disabled={!importType} onFileChosen={handleFileChange} /> : null}
        {/* import type-specific message }
        <Typography style={{ minHeight: '200px', margin: '10px 0' }}>{message ?? ''}</Typography>
        {/* import results table }
        <div style={{ minHeight: '200px', maxWidth: '80%', margin: '10px 0', overflowY: 'auto', overflowX: 'auto' }}>
          <Results />
        </div>
        {isError ? <NotificationMessage severity='error' message={formatAxiosError(error)} /> : null}*/}
      </div>
    </AuthLayout>
  );
}
