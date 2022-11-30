import { Box, Button, Paper, Theme, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { createUrl } from 'api/api_helpers';
import { CellErrorDescriptor, ParsedXLSXSheetResult } from 'api/api_interfaces';
import { Banner, SuccessBanner } from 'components/alerts/Banner';
import { Icon } from 'components/common';
import { SubHeader } from 'components/common/partials/SubHeader';
import Checkbox from 'components/form/Checkbox';
import FileInputValidation from 'components/form/FileInputValidation';
import HighlightTable from 'components/table/HighlightTable';
import { ImportStrings as constants } from 'constants/strings';
import useImported_XLSX_File from 'hooks/useImported_XLSX_File';
import { KeyXUploader } from 'pages/vendor/KeyXUploader';
import { useState } from 'react';
import { collectErrorsFromResults, computeXLSXCol, getAllUniqueKeys } from './xlsx_helpers';
const SIZE_LIMIT = 31457280;

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(2)
  },
  spacingTopBottom: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  paper: {
    marginTop: theme.spacing(2),
    padding: '16px',
    backgroundColor: 'text.secondary',
    display: 'flex',
    justifyContent: 'center'
  }
}));

interface RowColPair {
  row?: number;
  col?: string;
}
interface ImportTabProps {
  // children: JSX.Element;
  title?: string;
}
//sheetIndex: 0 -> animal and device : 1 -> telemetry
export const ImportAndPreviewTab = (props: ImportTabProps & { sheetIndex: 0 | 1 }) => {
  const { title, sheetIndex } = props;
  const styles = useStyles();
  const { isFileValidated, setSanitizedFile, sanitizedFile, isFileLoading, setFile } = useImported_XLSX_File();
  const [selectedError, setSelectedError] = useState<CellErrorDescriptor>(null);
  const [selectedCell, setSelectedCell] = useState<RowColPair>({});
  const [hideEmptyColumns, setHideEmptyColumns] = useState(true);
  const currentSheet = sanitizedFile?.length ? sanitizedFile[sheetIndex] : null;

  const handleCellSelected = (row_idx, cellname) => {
    setSelectedError(currentSheet.rows[row_idx].errors[cellname]);
    setSelectedCell({ row: row_idx, col: cellname });
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

  const getTableData = () => {
    const rows = currentSheet.rows.map((o, idx) => {
      return { row_index: idx + 2, ...o.row };
    }) as any[];
    console.log('For this: ' + JSON.stringify(currentSheet));
    console.log({ rows });
    return rows;
  };

  const computeExcelHeaderRow = (sheet: ParsedXLSXSheetResult, hideEmpty: boolean) => {
    const headers = ['1'];
    getHeaders(sheet, hideEmpty).forEach((o) => {
      const idx = sheet.headers.indexOf(o);
      headers.push(computeXLSXCol(idx));
    });

    return headers as string[];
  };

  const getTableHelpMessages = (sheet: ParsedXLSXSheetResult) => {
    const messages = sheet.rows.map((e, idx) => {
      return Object.entries(e.errors).reduce((prev, curr) => {
        const headerIdx = sheet.headers.indexOf(curr[0]);
        return { ...prev, [curr[0]]: `${computeXLSXCol(headerIdx)}${idx + 2}: ${curr[1].desc}` };
      }, {});
    });
    return messages;
  };

  return (
    <Box p={2}>
      <Box display='flex'>
        <Box pb={2}>
          <SubHeader text={title} />
        </Box>
        <Button
          href={createUrl({ api: 'get-template', query: 'file_key=import_template' })}
          style={{ marginLeft: 'auto' }}
          variant='outlined'>
          {constants.downloadButton}
        </Button>
      </Box>
      <FileInputValidation
        onFileChosen={setFile}
        trashIconClick={() => setSanitizedFile(null)}
        validationSuccess={isFileValidated}
        buttonText={`Upload ${title} Template`}
        buttonVariant='text'
        accept='.xlsx'
        isLoading={isFileLoading}
      />
      <>
        {sanitizedFile?.length > 0 && (
          <>
            <Typography className={styles.spacingTopBottom}>Upload Preview</Typography>
            {isFileValidated ? (
              <SuccessBanner text={constants.successBanner} />
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
                        ? `Row ${selectedCell.row + 2} "${selectedCell.col}": ${selectedError.help}`
                        : constants.detailBannerIdle}
                      {selectedError?.valid_values ? (
                        <Button
                          style={{ height: '26px', marginLeft: 'auto' }}
                          variant='contained'
                          onClick={() => {
                            // setShowingValueModal(true);
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
                <HighlightTable
                  data={getTableData()}
                  headers={['row_index', ...getHeaders(currentSheet, hideEmptyColumns)] as any}
                  secondaryHeaders={computeExcelHeaderRow(currentSheet, hideEmptyColumns)}
                  onSelectCell={handleCellSelected}
                  messages={getTableHelpMessages(currentSheet)}
                  rowIdentifier='row_index'
                  dimFirstColumn={true}
                />
              </>
            ) : (
              <>
                <Paper className={styles.paper}>No data entered into this worksheet</Paper>
              </>
            )}
          </>
        )}
        <Box display='flex'>
          <Checkbox
            label={constants.checkboxLabel}
            propName={'hide-empty-col'}
            initialValue={hideEmptyColumns}
            changeHandler={() => setHideEmptyColumns(!hideEmptyColumns)}
          />
          <Button
            disabled={!isFileValidated}
            className={styles.spacing}
            variant='contained'
            style={{ marginLeft: 'auto' }}>
            Finalize Submission
          </Button>
        </Box>
      </>
    </Box>
  );
};

export const AnimalAndDeviceImportTab = (props: ImportTabProps) => <ImportAndPreviewTab {...props} sheetIndex={0} />;
export const TelemetryImportTab = (props: ImportTabProps) => <ImportAndPreviewTab {...props} sheetIndex={1} />;
export const KeyXImportTab = (props: ImportTabProps) => {
  const { title } = props;
  return (
    <Box p={2}>
      <Box pb={2}>
        <SubHeader text={title} />
      </Box>
      <KeyXUploader />
    </Box>
  );
};
