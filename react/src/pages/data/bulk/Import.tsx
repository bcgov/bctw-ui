import { Box, Button, Paper, Tab, Tabs, Typography } from '@mui/material';
import { createFormData, createUrl } from 'api/api_helpers';
import { Icon, Modal } from 'components/common';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';
import { CellErrorDescriptor, IBulkUploadResults, ParsedXLSXSheetResult } from 'api/api_interfaces';
import AuthLayout from 'pages/layouts/AuthLayout';
import { eUserRole } from 'types/user';
import { SuccessBanner, Banner, InfoBanner } from 'components/alerts/Banner';
import { SubHeader } from 'components/common/partials/SubHeader';
import HighlightTable from 'components/table/HighlightTable';
import makeStyles from '@mui/styles/makeStyles';
import Checkbox from 'components/form/Checkbox';
import { AxiosError } from 'axios';
import FileInputValidation from 'components/form/FileInputValidation';
import { ImportStrings as constants } from 'constants/strings';
import { computeXLSXCol, collectErrorsFromResults, getAllUniqueKeys } from './xlsx_helpers';
import { PageTabs } from 'components/common/partials/PageTabs';
import { AnimalAndDeviceImportTab } from './ImportTabs';
import { TelemetryImportTab } from './ImportTabs';
import { KeyXImportTab } from './ImportTabs';

// const SIZE_LIMIT = 31457280;

// const useStyles = makeStyles((theme) => ({
//   spacing: {
//     marginTop: theme.spacing(2)
//   },
//   spacingTopBottom: {
//     marginTop: theme.spacing(2),
//     marginBottom: theme.spacing(2)
//   },
//   paper: {
//     marginTop: theme.spacing(2),
//     padding: '16px',
//     backgroundColor: 'text.secondary',
//     display: 'flex',
//     justifyContent: 'center'
//   }
// }));

// interface RowColPair {
//   row?: number;
//   col?: string;
// }

// type ImportTab = 'Animal and Device' | 'Telemetry' | 'Vectronic KeyX';
// enum TabNames {
//   metadata,
//   telemetry
// }

/**
 * @param message whats displayed as body of import modal
 * @param handleToast handler from parent, called when mutation is complete
 */
export default function Import(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  // const { tab, setTab, tabList } = useTabs(['Animal and Device', 'Telemetry', 'Vectronic KeyX']);

  // const [sanitizedImport, setSanitizedImport] = useState<ParsedXLSXSheetResult[]>(null);
  // const [canFinalize, setCanFinalize] = useState(false);
  // const [selectedError, setSelectedError] = useState<CellErrorDescriptor>(null);
  // const [selectedCell, setSelectedCell] = useState<RowColPair>({});
  // const [showingValueModal, setShowingValueModal] = useState(false);
  // const [hideEmptyColumns, setHideEmptyColumns] = useState(true);
  // const [currentTab, setCurrentTab] = useState(TabNames.metadata);
  // const styles = useStyles();

  // useEffect(() => {
  //   if (!sanitizedImport || !sanitizedImport?.length) {
  //     setCanFinalize(false);
  //     return;
  //   }
  //   if (sanitizedImport?.every((sheet) => sheet.rows.every((o) => o.success))) {
  //     setCanFinalize(true);
  //   } else {
  //     setCanFinalize(false);
  //   }
  // }, [sanitizedImport]);

  // const successXLSX = (d: ParsedXLSXSheetResult[]) => {
  //   if (d.length) {
  //     console.log(d);
  //     setSanitizedImport(d);
  //   } else {
  //     showNotif({ severity: 'error', message: 'The data sanitization process failed.' });
  //   }
  // };

  // const errorXLSX = (): void => {
  //   showNotif({ severity: 'error', message: 'bulk upload failed' });
  // };

  const successFinalize = (d: IBulkUploadResults<unknown>): void => {
    console.log(JSON.stringify(d, null, 2));
  };

  const errorFinalize = (): void => {
    showNotif({ severity: 'error', message: 'An error was encountered when trying to finalize the data upload.' });
  };

  // // setup the import mutation
  // const { mutateAsync, isIdle, isLoading, isSuccess, isError, error, data, reset } = api.useUploadXLSX({
  //   onSuccess: successXLSX,
  //   onError: errorXLSX
  // });
  const { mutateAsync: mutateFinalize, data: dataFinalize } = api.useFinalizeXLSX({
    onSuccess: successFinalize,
    onError: errorFinalize
  });
  // const { data: keyXdata } = api.useGetCollarKeyX();

  // const handleFileChange = (fieldName: string, files: FileList): void => {
  //   if (files[0].size > SIZE_LIMIT) {
  //     showNotif({ severity: 'error', message: 'This file exceeds the 30MB limit.' });
  //     return;
  //   }
  //   save(createFormData(fieldName, files));
  // };

  // // call the save mutation
  // const save = async (form: FormData): Promise<ParsedXLSXSheetResult[]> => {
  //   try {
  //     return await mutateAsync(form);
  //   } catch (err) {
  //     const e = err as AxiosError;
  //     showNotif({ severity: 'error', message: e.message });
  //     return null;
  //   }
  // };

  // const handleChangeTab = (event: SyntheticEvent<Element>, newVal: TabNames): void => {
  //   setCurrentTab(newVal);
  // };

  // const getCurrentSheet = (): ParsedXLSXSheetResult => {
  //   return sanitizedImport[tab.idx];
  // };

  // const handleCellSelected = (row_idx, cellname) => {
  //   const sheet = getCurrentSheet();
  //   setSelectedError(sheet.rows[row_idx].errors[cellname]);
  //   setSelectedCell({ row: row_idx, col: cellname });
  // };

  // const getHeaders = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean): string[] => {
  //   let headers = [];
  //   if (hideEmpty) {
  //     headers = [...getAllUniqueKeys(sheet)];
  //   } else {
  //     headers = sheet.headers;
  //   }
  //   return headers;
  // };

  // const getTableData = () => {
  //   const rows = getCurrentSheet().rows.map((o, idx) => {
  //     return { row_index: idx + 2, ...o.row };
  //   }) as any[];
  //   console.log('For this: ' + JSON.stringify(getCurrentSheet()));
  //   console.log({ rows });
  //   return rows;
  // };

  // const computeExcelHeaderRow = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean) => {
  //   const headers = ['1'];
  //   getHeaders(sheet, hideEmpty).forEach((o) => {
  //     const idx = sheet.headers.indexOf(o);
  //     headers.push(computeXLSXCol(idx));
  //   });

  //   return headers as string[];
  // };

  // const getTableHelpMessages = (sheet: ParsedXLSXSheetResult) => {
  //   const messages = sheet.rows.map((e, idx) => {
  //     return Object.entries(e.errors).reduce((prev, curr) => {
  //       const headerIdx = sheet.headers.indexOf(curr[0]);
  //       return { ...prev, [curr[0]]: `${computeXLSXCol(headerIdx)}${idx + 2}: ${curr[1].desc}` };
  //     }, {});
  //   });
  //   return messages;
  // };

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      <div className='container'>
        <h1>Data Import</h1>
        <Box mt={2}>
          {/* Missing telemetry tab until more information about new table */}
          <PageTabs keepMounted tabLabels={['Animal and Device', 'Vectronic KeyX']}>
            <AnimalAndDeviceImportTab />
            {/* <TelemetryImportTab /> */}
            <KeyXImportTab />
          </PageTabs>
        </Box>
      </div>
    </AuthLayout>

    // <AuthLayout required_user_role={eUserRole.data_administrator}>
    //   <div className='container'>
    //     <h1>Data Import</h1>
    //     <Box mt={2}>
    //       <PageTabs tab={tab.idx} tabList={tabList} handleTab={setTab}>
    //         <Box className={styles.spacing} p={2}>
    //           <Box display='flex'>
    //             <SubHeader text={tab.label} />
    //             {!isTab('Vectronic KeyX') && (
    //               <Button
    //                 href={createUrl({ api: 'get-template', query: 'file_key=import_template' })}
    //                 style={{ marginLeft: 'auto' }}
    //                 variant='outlined'>
    //                 {constants.downloadButton}
    //               </Button>
    //             )}
    //           </Box>
    //           <Box className={styles.spacing}>
    //             <Banner variant='info' text={constants[tab.label]} />
    //           </Box>
    //           {!isTab('Vectronic KeyX') && (
    //             <FileInputValidation
    //               onFileChosen={handleFileChange}
    //               trashIconClick={() => setSanitizedImport(null)}
    //               validationSuccess={canFinalize}
    //               buttonText={`Upload ${tab.label} Template`}
    //               buttonVariant='text'
    //               accept='.xlsx'
    //               isLoading={isLoading}
    //             />
    //           )}
    // {/* Animal and Device */}
    // {!isTab('Vectronic KeyX') && (
    //   <>
    //     {sanitizedImport?.length > 0 && (
    //       <>
    //         <Typography className={styles.spacingTopBottom}>Upload Preview</Typography>
    //         {canFinalize ? (
    //           <SuccessBanner text={constants.successBanner} />
    //         ) : (
    //           <>
    //             <Banner
    //               variant='error'
    //               text={constants.errorBanner}
    //               icon={<Icon icon='error' />}
    //               action='collapse'
    //               hiddenContent={collectErrorsFromResults(getCurrentSheet()).map((a) => (
    //                 <div>{a}</div>
    //               ))}
    //             />
    //             <Banner
    //               variant='info'
    //               text={
    //                 <Box alignItems={'center'} display='flex'>
    //                   {selectedError
    //                     ? `Row ${selectedCell.row + 2} "${selectedCell.col}": ${selectedError.help}`
    //                     : constants.detailBannerIdle}
    //                   {selectedError?.valid_values ? (
    //                     <Button
    //                       style={{ height: '26px', marginLeft: 'auto' }}
    //                       variant='contained'
    //                       onClick={() => {
    //                         setShowingValueModal(true);
    //                       }}>
    //                       Show Values
    //                     </Button>
    //                   ) : null}
    //                 </Box>
    //               }
    //               icon={<Icon icon='help' />}
    //             />
    //           </>
    //         )}
    //         {/* <Tabs value={currentTab} className='tabs' onChange={handleChangeTab}>
    //           <Tab label={'Animal+Device Metadata'} value={TabNames.metadata} />
    //           <Tab label={'Telemetry'} value={TabNames.telemetry} />
    //         </Tabs> */}
    //         {getCurrentSheet().rows.length > 0 ? (
    //           <>
    //             <HighlightTable
    //               data={getTableData()}
    //               headers={['row_index', ...getHeaders(getCurrentSheet(), hideEmptyColumns)] as any}
    //               secondaryHeaders={computeExcelHeaderRow(getCurrentSheet(), hideEmptyColumns)}
    //               onSelectCell={handleCellSelected}
    //               messages={getTableHelpMessages(getCurrentSheet())}
    //               rowIdentifier='row_index'
    //               dimFirstColumn={true}
    //             />
    //           </>
    //         ) : (
    //           <>
    //             <Paper className={styles.paper}>No data entered into this worksheet</Paper>
    //           </>
    //         )}
    //       </>
    //     )}
    //               <Box display='flex'>
    //                 <Checkbox
    //                   label={constants.checkboxLabel}
    //                   propName={'hide-empty-col'}
    //                   initialValue={hideEmptyColumns}
    //                   changeHandler={() => setHideEmptyColumns(!hideEmptyColumns)}
    //                 />
    //                 <Button
    //                   disabled={!canFinalize}
    //                   className={styles.spacing}
    //                   variant='contained'
    //                   style={{ marginLeft: 'auto' }}>
    //                   Finalize Submission
    //                 </Button>
    //               </Box>
    //             </>
    //           )}
    //           {/* Missing Telemetry Import */}
    //           {/* {isTab('Telemetry') && <InfoBanner text={constants.telemetryBullets} />} */}
    //           {/* Vectronic KeyX Import */}
    //           {isTab('Vectronic KeyX') && <KeyXUploader pageRows={5} />}
    //         </Box>
    //       </PageTabs>
    //     </Box>

    //     {/*
    //     <Typography mb={3} variant='body1' component='p'>Import metadata via CSV file.</Typography>
    //     {/* save progress indicator }
    //     {isLoading ? <div>saving...<CircularProgress /></div> : null}
    //     {/* import type options and instructions *}
    //     <div className={'import-setup'}>
    //       <div className={'import-choice'}>
    //         <Typography variant='h5'>{'What do you want to import?'}</Typography>
    //         <RadioGroup aria-label='position' value={importType} onChange={changeImportType}>
    //           {radios.map((r) => (
    //             <FormControlLabel
    //               value={r.value}
    //               control={<Radio color='primary' />}
    //               label={r.header}
    //               labelPlacement='end'
    //             />
    //           ))}
    //         </RadioGroup>
    //       </div>
    //       <div className={'import-steps'}>
    //         <Typography variant='h5'>{'Import Instructions'}</Typography>
    //         <ol>
    //           {ImportSteps.map((step, index) => {
    //             if (index === 1 && importType) {
    //               return <li onClick={downloadTemplate} className={'cell-clickable'}>{step}</li>;
    //             }
    //             return <li>{step}</li>;
    //           })}
    //         </ol>
    //       </div>
    //     </div>{' '}
    //     {/* import-setup}
    //     {/* upload/try again button}
    //     {(isSuccess || isError) && !canFinalize ? (
    //       <Button color='primary' variant='contained' onClick={reset}>Upload Again</Button>
    //     ) : null}
    //     {isIdle ? <FileInput accept='.csv' disabled={!importType} onFileChosen={handleFileChange} /> : null}
    //     {/* import type-specific message }
    //     <Typography style={{ minHeight: '200px', margin: '10px 0' }}>{message ?? ''}</Typography>
    //     {/* import results table }
    //     <div style={{ minHeight: '200px', maxWidth: '80%', margin: '10px 0', overflowY: 'auto', overflowX: 'auto' }}>
    //       <Results />
    //     </div>
    //     {isError ? <NotificationMessage severity='error' message={formatAxiosError(error)} /> : null}*/}
    //   </div>
    // </AuthLayout>
  );
}

/*
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
        </>
        );
      }
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
    }a
    return <BasicTable data={toShow} headers={Object.keys(toShow[0])} rowIdentifier={'id'} />;
  };*/

/*
    // the radio button handler
  const changeImportType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value as eImportType;
    setImportType(val);
  };*/

/*
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
  */

/*
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
  };*/

/*
  
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

*/
