import { Box } from '@mui/material';
import { Button } from 'components/common';
// import { ExportImportProps } from 'components/component_interfaces';
import Export from 'pages/data/bulk/Export';
// import Import from 'pages/data/bulk/Import';
import { ReactNode, useState } from 'react';

export type IImportExportProps<T> = {
  iTitle?: string;
  iMsg?: string | ReactNode;
  eTitle?: string;
  eMsg?: string;
  data: T[];
  iDisabled?: boolean;
  eDisabled?: boolean;
  downloadTemplate?: () => void;
};

/**
 * used in data management views to wrap the import/export components
 * and control their modal show/hide status with a button group
 */
export default function ImportExportViewer<T>({ data, eTitle, eMsg, eDisabled = false }: IImportExportProps<T>): JSX.Element {
  const [showExportModal, setShowExportModal] = useState(false);
  // const [showImportModal, setShowImportModal] = useState(false);

  const handleClickExport = (): void => setShowExportModal(o => !o);

  // const handleClickImport = (): void => setShowImportModal(o => !o);

  const handleClose = (): void => {
    setShowExportModal(false);
    // setShowImportModal(false);
  }

  // const importProps: ExportImportProps = { title: iTitle, message: iMsg, handleClose, open: showImportModal, downloadTemplate }
  const exportProps = { title: eTitle, message: eMsg, data, handleClose, open: showExportModal }

  return (
    <Box ml={1}>
      {/* <Button size='large' color='primary' onClick={handleClickImport} disabled={iDisabled}>Import</Button> */}
      <Button onClick={handleClickExport} disabled={eDisabled || !data.length}>Export</Button>
      {/* {iDisabled ? null : <Import  />} */}
      {eDisabled ? null : <Export {...exportProps} />}
    </Box>
  );
}
