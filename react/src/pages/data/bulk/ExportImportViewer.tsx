import React, { useState } from 'react';
import Export from 'pages/data/bulk/Export';
import Import from 'pages/data/bulk/Import';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';

type IImportExportProps<T> = {
  iTitle: string;
  iMsg: string;
  eTitle: string;
  eMsg: string;
  data: T[];
  handleToast?: (msg: string) => void;
};

export default function ImportExportViewer<T>(props: IImportExportProps<T>) {
  const { data, iTitle, iMsg, eTitle, eMsg, handleToast } = props;
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const handleClickExport = () => {
    setShowExportModal(o => !o);
  };
  const handleClickImport = () => {
    setShowImportModal(o => !o);
  }
  const handleClose = () => {
    setShowExportModal(false);
    setShowImportModal(false);
  }

  const importProps = { title: iTitle, message: iMsg, handleClose, open: showImportModal, handleToast }
  const exportProps = { title: eTitle, message: eMsg, data, handleClose, open: showExportModal }

  return (
    <>
      <Import {...importProps} />
      <Export {...exportProps} />
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClickExport}>export</Button>
        <Button onClick={handleClickImport}>import</Button>
      </ButtonGroup>
    </>
  );
}
