import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress, Paper, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { createUrl } from 'api/api_helpers';
import { AnimalCollar, CellErrorDescriptor, ParsedXLSXSheetResult, WarningInfo } from 'api/api_interfaces';
import { Banner, InfoBanner } from 'components/alerts/Banner';
import { Icon, Modal } from 'components/common';
import { SubHeader } from 'components/common/partials/SubHeader';
import Select from 'components/form/BasicSelect';
import Checkbox from 'components/form/Checkbox';
import FileInputValidation from 'components/form/FileInputValidation';
import HighlightTable from 'components/table/HighlightTable';
import { ImportStrings as constants } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTabs } from 'contexts/TabsContext';
import useImported_XLSX_File from 'hooks/useImported_XLSX_File';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import useUser from 'hooks/useUser';
import { KeyXUploader } from 'pages/vendor/KeyXUploader';
import { useEffect, useState } from 'react';
import { BCTWBase } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import WarningPromptsBanner from './WarningPromptsBanner';
import { collectErrorsFromResults, collectWarningsFromResults, computeXLSXCol, getAllUniqueKeys } from './xlsx_helpers';

const useStyles = makeStyles((theme: Theme) => ({
  userSelect: {
    // minWidth: '12rem'
    marginRight: theme.spacing(2)
  },
  spacing: {
    marginTop: theme.spacing(2)
  },
  spacingTopBottom: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2)
  },
  paper: {
    marginTop: theme.spacing(2),
    padding: '16px',
    backgroundColor: 'text.secondary',
    display: 'flex',
    justifyContent: 'center'
  },
  circularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    height: '20px !important',
    width: '20px !important',
    marginLeft: '-17px',
    marginTop: '-10px'
  }
}));

enum SheetNames {
  AnimalAndDevice,
  Telemetry
}
interface RowColPair {
  row?: number;
  col?: string;
}
interface ImportTabProps {
  title?: string;
  tabIndex?: number;
  show?: boolean;
}

type AnimalCollarRow = AnimalCollar & {
  row_index: number;
};
//sheetIndex: 0 -> animal and device : 1 -> telemetry
export const ImportAndPreviewTab = (props: ImportTabProps & { sheetIndex: SheetNames; handleSubmit: () => void }) => {
  const { title, sheetIndex, handleSubmit, show } = props;
  const api = useTelemetryApi();

  const user = useUser();
  const { data: users, isLoading: loadingUsers } = api.useUsers(0);
  const [importUserID, setImportUserID] = useState<number>(null);
  const userID = importUserID ?? user?.id;

  const showNotif = useResponseDispatch();
  const { isValidated, isLoading, reset, setFile, sanitizedFile } = useImported_XLSX_File();
  const styles = useStyles();
  // const { isSuccess, data: importData, error, refetch } = api.useGetTemplate('import_template');

  const [selectedError, setSelectedError] = useState<CellErrorDescriptor>(null);
  const [selectedCell, setSelectedCell] = useState<RowColPair>({});
  const [warnings, setWarnings] = useState<WarningInfo[]>([]);
  const [hideEmptyColumns, setHideEmptyColumns] = useState(true);
  const [showingValueModal, setShowingValueModal] = useState(false);
  const [filename, setFilename] = useState('');

  const currentSheet = sanitizedFile?.length ? sanitizedFile[sheetIndex] : null;
  const warningsAllConfirmed = warnings?.length == 0 || warnings.every((warning) => !!warning.checked);

  // useEffect(() => {
  //   if (isSuccess) {
  //     console.log('Import Template downloaded');
  //     const b = importData.blob();
  //     URL.createObjectURL(b);
  //   }
  // }, [importData, isSuccess]);

  const onSuccessFinalize = (): void => {
    showNotif({ severity: 'success', message: 'Your import was successful.' });
    handleFileClear();
  };

  const onErrorFinalize = (): void => {
    showNotif({ severity: 'error', message: 'An error was encountered when trying to finalize the data upload.' });
  };

  const { isLoading: isLoadingFinalize, mutateAsync: mutateFinalize } = api.useFinalizeXLSX({
    onSuccess: onSuccessFinalize,
    onError: onErrorFinalize
  });

  useEffect(() => {
    if (currentSheet) {
      const warnings = collectWarningsFromResults(currentSheet);
      setWarnings(warnings);
    }
  }, [currentSheet]);

  const handleCellSelected = (row_idx: number, cellname: string): void => {
    setSelectedError(currentSheet.rows[row_idx].errors[cellname]);
    setSelectedCell({ row: row_idx, col: cellname });
  };

  const handleFileUpload = (fieldname: string, files: FileList): void => {
    setFilename(files[0].name);
    setFile(fieldname, files);
  };

  const handleFileClear = (): void => {
    setFilename('');
    reset();
  };

  const getHeaders = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean): string[] => {
    let headers = [];
    if (hideEmpty) {
      headers = [...getAllUniqueKeys(sheet)];
    } else {
      headers = sheet.headers;
    }
    return headers;
  };

  /**
   * TODO Add correct type for this.
   */
  const getTableData = (): any[] => {
    const rows = currentSheet.rows.map((o, idx) => {
      return { row_index: idx + 2, ...o.row } as AnimalCollarRow;
    });
    return rows;
  };

  const computeExcelHeaderRow = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean): string[] => {
    const headers = ['1'];
    getHeaders(sheet, hideEmpty).forEach((o) => {
      const idx = sheet.headers.indexOf(o);
      headers.push(computeXLSXCol(idx));
    });

    return headers;
  };
  //What is the return type of this function?
  const getTableHelpMessages = (sheet: ParsedXLSXSheetResult) => {
    const messages = sheet.rows.map((e, idx) => {
      return Object.entries(e.errors).reduce((prev, curr) => {
        const headerIdx = sheet.headers.indexOf(curr[0]);
        return { ...prev, [curr[0]]: `${computeXLSXCol(headerIdx)}${idx + 2}: ${curr[1].desc}` };
      }, {});
    });
    return messages;
  };

  const handleCheckWarning = (idx: number, checked: boolean): void => {
    const tmp = warnings;
    tmp[idx].checked = checked;
    setWarnings([...tmp]);
  };

  return (
    <>
      <Box display={!show && 'none'}>
        <Box display='flex' alignItems='center'>
          <Box>
            <SubHeader text={`${title} Import`} />
          </Box>
          <Button
            href={createUrl({
              api: 'get-template',
              query: `file_key=import_template&responseType=arrayBuffer&responseEncoding=binary`
            })}
            download={constants.templateFileName}
            style={{ marginLeft: 'auto' }}
            variant='outlined'>
            {constants.downloadButton}
          </Button>
        </Box>
        <Box className={styles.spacing}>
          <InfoBanner
            //Dont love this, but enums are dumb
            text={sheetIndex === SheetNames.Telemetry ? constants['Telemetry'] : constants['Animal and Device']}
          />
        </Box>
        <FileInputValidation
          filename={filename}
          onFileChosen={handleFileUpload}
          trashIconClick={handleFileClear}
          validationSuccess={isValidated}
          buttonText={`Upload ${title} Template`}
          buttonVariant='text'
          accept='.xlsx'
          isLoading={isLoading}
        />
        <>
          {sanitizedFile?.length > 0 && (
            <>
              <Box className={styles.spacingTopBottom}>
                <SubHeader size='small' text='Upload Preview' />
              </Box>
              {isValidated ? (
                <WarningPromptsBanner
                  allClearText={constants.successBanner}
                  text={constants.warningBanner}
                  prompts={warnings}
                  allChecked={warningsAllConfirmed}
                  setWarningChecked={handleCheckWarning}
                />
              ) : (
                <>
                  <Banner
                    variant='error'
                    text={constants.errorBanner}
                    icon={<Icon icon='error' />}
                    action='collapse'
                    hiddenContent={collectErrorsFromResults(currentSheet).map((a) => (
                      <div>{a}</div>
                    ))}
                  />
                  <Banner
                    variant='info'
                    text={
                      <Box alignItems={'center'} display='flex'>
                        {selectedError
                          ? `Row ${selectedCell.row + 2} "${columnToHeader(selectedCell.col)}": ${selectedError.help}`
                          : constants.detailBannerIdle}
                        {selectedError?.valid_values ? (
                          <Button
                            style={{ height: '26px', marginLeft: 'auto' }}
                            variant='contained'
                            onClick={() => {
                              setShowingValueModal(true);
                            }}>
                            Show Values
                          </Button>
                        ) : null}
                      </Box>
                    }
                    icon={<Icon icon='help' />}
                  />
                </>
              )}
              {currentSheet.rows.length > 0 ? (
                <>
                  {/* TODO Add correct type for the headers */}
                  <HighlightTable
                    data={getTableData()}
                    headers={
                      [
                        'row_index',
                        ...getHeaders(currentSheet, hideEmptyColumns)
                      ] as (keyof BCTWBase<AnimalCollarRow>)[]
                    }
                    secondaryHeaders={computeExcelHeaderRow(currentSheet, hideEmptyColumns)}
                    onSelectCell={handleCellSelected}
                    messages={getTableHelpMessages(currentSheet)}
                    rowIdentifier='row_index'
                    dimFirstColumn={true}
                    warningRows={warnings.map((w) => {
                      if (!w.checked && isValidated) {
                        return w.row;
                      }
                    })}
                  />
                </>
              ) : (
                <>
                  <Paper className={styles.paper}>No data entered into this worksheet</Paper>
                </>
              )}
            </>
          )}
          <Box className={styles.spacing} display='flex' justifyContent='space-between'>
            <Box>
              {sanitizedFile && (
                <Checkbox
                  label={constants.checkboxLabel}
                  propName={'hide-empty-col'}
                  initialValue={hideEmptyColumns}
                  changeHandler={() => setHideEmptyColumns(!hideEmptyColumns)}
                />
              )}
            </Box>
            {/* TODO: Move the mutation for this outside this component */}
            <Box>
              {user?.is_admin ? (
                <Select
                  className={styles.userSelect}
                  defaultValue={user?.nameID}
                  label='Assign data to'
                  values={users ? users.map((u) => u.nameID) : [user?.nameID]}
                  handleChange={(n: string): void => {
                    const [name, id] = n.split(' - ');
                    setImportUserID(parseInt(id));
                  }}
                />
              ) : null}
              <LoadingButton
                onClick={() => mutateFinalize(currentSheet.rows.map((r) => r.row))}
                disabled={!isValidated || !warningsAllConfirmed || isLoadingFinalize || !userID}
                variant='contained'
                loading={isLoadingFinalize}
                loadingIndicator={<CircularProgress color='inherit' className={styles.circularProgress} />}
                loadingPosition={'end'}
                endIcon={<Icon icon='send' />}>
                Finalize Submission
              </LoadingButton>
            </Box>
          </Box>
        </>
      </Box>
      <Modal
        open={showingValueModal}
        handleClose={() => {
          setShowingValueModal(false);
        }}
        title={constants.validValuesModal}>
        {selectedError?.valid_values?.map((o) => {
          return (
            <>
              <Typography>{o}</Typography>
            </>
          );
        })}
      </Modal>
    </>
  );
};
//Move the mutate / state to these wrapper components
//Make sure the reset/handleFileClear is called after both the telemetry and animalDevice
export const AnimalAndDeviceImportTab = (props: ImportTabProps) => {
  const handleSubmit = (): void => {
    console.log('submitting animal and device');
  };
  return <ImportAndPreviewTab {...props} sheetIndex={SheetNames.AnimalAndDevice} handleSubmit={handleSubmit} />;
};
export const TelemetryImportTab = (props: ImportTabProps) => {
  const handleSubmit = (): void => {
    console.log('submitting telemetry');
  };
  return <ImportAndPreviewTab {...props} sheetIndex={SheetNames.Telemetry} handleSubmit={handleSubmit} />;
};
export const KeyXImportTab = (props: ImportTabProps) => {
  const { title, show, tabIndex } = props;
  const { setTabStatus, tabsValidation } = useTabs();
  const handleAllKeyXUploaded = (status: boolean): void => {
    setTabStatus(tabIndex, status ? 'success' : 'warning');
  };
  return (
    <Box display={!show && 'none'}>
      <Box pb={2}>
        <SubHeader text={`${title} Import`} />
      </Box>
      <KeyXUploader handleAllKeyXUploaded={handleAllKeyXUploaded} />
    </Box>
  );
};
