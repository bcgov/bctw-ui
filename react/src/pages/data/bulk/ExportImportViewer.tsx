import { Box } from '@mui/material';
import { Button } from 'components/common';
import Export from 'pages/data/bulk/Export';
import { useState } from 'react';

export type ExportPageProps<T> = {
  eTitle: string;
  eMsg?: string;
  eDisabled?: boolean;
  template: (keyof T)[];
};

/**
 * used in data management views to wrap the export component and control the modal visibility
 */
export default function ExportViewer<T>({
  eTitle,
  eMsg,
  template,
  eDisabled = false
}: ExportPageProps<T>): JSX.Element {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleClickExport = (): void => setShowExportModal((o) => !o);

  const handleClose = (): void => {
    setShowExportModal(false);
  };

  const exportProps = { title: eTitle, message: eMsg, handleClose, open: showExportModal, template };

  return (
    <Box ml={1}>
      <Button onClick={handleClickExport} disabled={eDisabled} size='medium'>
        Export
      </Button>
      {eDisabled ? null : <Export {...exportProps} />}
    </Box>
  );
}
