import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress, Paper, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { createUrl } from 'api/api_helpers';
import {
  CellErrorDescriptor,
  ParsedAnimalCollar,
  ParsedXLSXSheetResult,
  WarningInfo,
  XLSXPayload
} from 'api/api_interfaces';
import { Banner, InfoBanner } from 'components/alerts/Banner';
import { Icon, Modal } from 'components/common';
import { SubHeader } from 'components/common/partials/SubHeader';
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
import { columnToHeader } from 'utils/common_helpers';
import WarningPromptsBanner from './WarningPromptsBanner';
import { collectErrorsFromResults, collectWarningsFromResults, computeXLSXCol, getAllUniqueKeys } from './xlsx_helpers';
import { Critter } from 'types/animal';
import Select from 'components/form/BasicSelect';
import { AxiosError } from 'axios';

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

// type AnimalCollarRow = AnimalCollar & {
//   row_index: number;
// };
//sheetIndex: 0 -> animal and device : 1 -> telemetry
const ImportAndPreviewTab = (props: ImportTabProps & { sheetIndex: SheetNames; handleSubmit: () => void }) => {
  const rowIndexHeader = 'row_index';
  const critterDropdownHeader = 'select_wlh_id';

  const { title, sheetIndex, show } = props;
  const api = useTelemetryApi();

  const user = useUser();
  const { data: users } = api.useUsers(0);
  const [importUserID, setImportUserID] = useState<number>(null);
  const userID = importUserID ?? user?.id;

  const showNotif = useResponseDispatch();
  const { isValidated, isLoading, reset, setFile, sanitizedFile, defaultCritterValue } = useImported_XLSX_File();
  const styles = useStyles();

  const [selectedError, setSelectedError] = useState<CellErrorDescriptor>(null);
  const [selectedCell, setSelectedCell] = useState<RowColPair>({});
  const [warnings, setWarnings] = useState<WarningInfo[]>([]);
  const [hideEmptyColumns, setHideEmptyColumns] = useState(true);
  const [showingValueModal, setShowingValueModal] = useState(false);
  const [filename, setFilename] = useState('');
  const [serverError, setServerError] = useState<string>('');

  const currentSheet = sanitizedFile?.length ? sanitizedFile[sheetIndex] : null;
  const warningsAllConfirmed = warnings?.length == 0 || warnings.every((warning) => !!warning.checked);
  const unspecifiedCritters = currentSheet?.rows.some((r) => r.row.selected_critter_id === '');

  const onSuccessFinalize = (): void => {
    showNotif({ severity: 'success', message: 'Your import was successful.' });
    handleFileClear();
    setServerError('');
  };

  const onErrorFinalize = (error: AxiosError, variables: XLSXPayload, context: unknown): void => {
    const response = error.response.data?.error ? error.response.data.error : JSON.stringify(error.response.data);
    //showNotif({ severity: 'error', message: `${response}` });
    setServerError(response);
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
    setServerError('');
  };

  const getHeaders = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean) => {
    let headers = [];
    if (hideEmpty) {
      headers = [rowIndexHeader, critterDropdownHeader, ...getAllUniqueKeys(sheet)];
    } else {
      headers = [rowIndexHeader, critterDropdownHeader, ...sheet.headers];
    }
    return headers;
  };

  const selectCritterDropdownElement = (
    possible_critters: { critter_id: string; wlh_id: string }[],
    wlhIdForThisRow: string,
    onChange: (selectedVal: string) => void
  ): JSX.Element => {
    const possible_values =
      possible_critters.length == 0 ? ['New Critter'] : [...possible_critters.map((a) => a.critter_id), 'New Critter'];
    const value_labels =
      possible_critters.length == 0
        ? ['New Critter']
        : [...possible_critters.map((a) => a.wlh_id ?? a.critter_id), 'New Critter'];

    const defaultVal = defaultCritterValue(possible_critters, wlhIdForThisRow);

    return (
      <Select
        className='' //remove default styling which affects the width of this field
        sx={{ minWidth: '160px' }}
        disabled={possible_critters.length == 0}
        defaultValue={defaultVal}
        values={possible_values}
        handleChange={onChange}
        valueLabels={value_labels}
      />
    );
  };
  /**
   * TODO Add correct type for this.
   */
  const getTableData = () => {
    const rows = currentSheet.rows.map((o, idx) => {
      return {
        [rowIndexHeader]: idx + 2,
        [critterDropdownHeader]: selectCritterDropdownElement(
          o.row.possible_critters,
          (o.row as Critter).wlh_id,
          (v) => {
            o.row.selected_critter_id = v;
          }
        ),
        ...o.row
      };
    });
    return rows;
  };

  const computeExcelHeaderRow = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean): string[] => {
    const headers = ['1', ''];
    getHeaders(sheet, hideEmpty)
      .filter((a) => a !== rowIndexHeader && a !== critterDropdownHeader)
      .forEach((o) => {
        const idx = sheet.headers.indexOf(o);
        headers.push(computeXLSXCol(idx));
      });

    return headers;
  };

  const getTableHelpMessages = (sheet: ParsedXLSXSheetResult): Record<number, Partial<Record<string, string>>>[] => {
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

  const handleFinalizeClick = async () => {
    try {
      await mutateFinalize({ user_id: userID, payload: currentSheet.rows.map((r) => r.row) });
    } catch (e) {
      console.log('Safely handled an error in XLSX finalization.');
    }
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
            text={sheetIndex === SheetNames.Telemetry ? constants['Telemetry'] : constants['Critter and Device']}
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
              {serverError && (
                <Banner
                  variant='error'
                  text={`The server rejected the submission. This response may direct you to solve the issue:\n${JSON.stringify(
                    serverError
                  )}`}
                  icon={<Icon icon='error' />}
                />
              )}
              {isValidated ? (
                <WarningPromptsBanner
                  allClearText={constants.successBanner}
                  text={constants.warningBanner}
                  prompts={warnings}
                  allChecked={warningsAllConfirmed}
                  unspecifiedCritterRows={currentSheet.rows.flatMap((a, idx) =>
                    a.row.selected_critter_id == '' ? [idx + 2] : []
                  )}
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
                    headers={[...getHeaders(currentSheet, hideEmptyColumns)]}
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
            <p>{user?.is_admin}</p>
            <Box>
              {user?.is_admin ? (
                <Select
                  className={styles.userSelect}
                  defaultValue={user?.nameID}
                  label='Assign data to'
                  values={users ? users.map((u) => u.nameID) : [user?.nameID]}
                  handleChange={(n: string): void => {
                    const nameID = n.split(' - ');
                    setImportUserID(parseInt(nameID[1]));
                  }}
                />
              ) : null}
              <LoadingButton
                onClick={handleFinalizeClick}
                disabled={!isValidated || !warningsAllConfirmed || isLoadingFinalize || !userID || unspecifiedCritters}
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
    // console.log('submitting animal and device');
  };
  return <ImportAndPreviewTab {...props} sheetIndex={SheetNames.AnimalAndDevice} handleSubmit={handleSubmit} />;
};
export const TelemetryImportTab = (props: ImportTabProps) => {
  const handleSubmit = (): void => {
    // console.log('submitting telemetry');
  };
  return <ImportAndPreviewTab {...props} sheetIndex={SheetNames.Telemetry} handleSubmit={handleSubmit} />;
};
export const KeyXImportTab = (props: ImportTabProps) => {
  const { title, show, tabIndex } = props;
  const { setTabStatus } = useTabs();
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
