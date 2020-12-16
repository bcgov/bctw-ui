import React, { useState } from 'react';
import Export from 'pages/data/bulk/Export';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IImportExportProps<T> = {
  data: T[];
  title?: string;
};

export default function ImportExportViewer<T>(props: IImportExportProps<T>) {
  const { data, title } = props;
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const handleClickExport = () => {
    setShowExportModal(o => !o);
  };
  const handleClickImport = () => {
    setShowImportModal(o => !o);
  }
  const handleClose = (b: boolean) => {
    setShowExportModal(false);
    setShowImportModal(false);
  }

  return (
    <>
      <Export title={title ?? 'Export Animals'} data={data} show={showExportModal} onClose={handleClose} />
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClickExport}>export</Button>
        <Button onClick={handleClickImport}>import</Button>
      </ButtonGroup>
    </>
  );
}
