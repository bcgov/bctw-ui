import { Box } from '@mui/material';
import { Button } from 'components/common';
import { buttonProps } from 'components/component_constants';
import { useState } from 'react';
import Export from './Export';

type ExportPageProps<T> = {
  eTitle: string;
  eMsg?: string;
  eDisabled?: boolean;
  data?: T[];
  template: (keyof T)[];
};

/**
 * used in data management views to wrap the export component and control the modal visibility
 */
export default function ExportViewer<T>({
  eTitle,
  eMsg,
  template,
  data,
  eDisabled = false
}: ExportPageProps<T>): JSX.Element {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleClickExport = (): void => setShowExportModal((o) => !o);

  const handleClose = (): void => {
    setShowExportModal(false);
  };

  const exportProps = { title: eTitle, message: eMsg, handleClose, open: showExportModal, template, data };
  return (
    <Box ml={1}>
      <Button onClick={handleClickExport} disabled={eDisabled || !data?.length} {...buttonProps}>
        Export
      </Button>
      {eDisabled ? null : <Export {...exportProps} />}
    </Box>
  );
}
