import { Box } from '@mui/material';
import { Button } from 'components/common';
import Export from 'pages/data/bulk/Export';
import { useState } from 'react';

export type IImportExportProps<T> = {
  eTitle: string;
  eMsg?: string;
  data: T[];
  eDisabled?: boolean;
  template: (keyof T)[];
};

/**
 * used in data management views to wrap the import/export components
 * and control their modal show/hide status with a button group
 */
export default function ImportExportViewer<T>({ data, eTitle, eMsg, template, eDisabled = false }: IImportExportProps<T>): JSX.Element {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleClickExport = (): void => setShowExportModal(o => !o);

  const handleClose = (): void => {
    setShowExportModal(false);
  }

  const exportProps = { title: eTitle, message: eMsg, data, handleClose, open: showExportModal, template }

  return (
    <Box ml={1}>
      <Button onClick={handleClickExport} disabled={eDisabled || !data.length}>Export</Button>
      {eDisabled ? null : <Export {...exportProps} />}
    </Box>
  );
}
