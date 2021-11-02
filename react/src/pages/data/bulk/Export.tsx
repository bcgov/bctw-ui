import { CircularProgress } from '@mui/material';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import dayjs from 'dayjs';
import download from 'downloadjs';
import { useEffect, useState } from 'react';
import { formatT } from 'utils/time';

type ImportProps<T> = ModalBaseProps & { data: T[], template: (keyof T)[] };

export default function Export<T>({ data, handleClose, open, template, title }: ImportProps<T>): JSX.Element {
  const [downloading, setIsDownloading] = useState(true);
  const fields = template.join(',');

  useEffect(() => {
    if (open) {
      setIsDownloading(true);
      exportData();
    }
  }, [open]);

  const exportData = (): void => {
    const body = data
      .map((d) => {
        let r = '';
        for (let i = 0; i < template.length; i++) {
          const key = template[i];
          const value = d[key];
          r += value ?? '';
          r += i !== template.length - 1 ? ',' : '\n';
        }
        return r;
      })
      .join('');
    download(`${fields}\n${body}`, `${title}_${formatT(dayjs())}.csv`, 'csv');
    setIsDownloading((o) => !o);
    handleClose(false);
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      {downloading ? (
        <div>
          downloading
          <CircularProgress />
        </div>
      ) : (
        <div>no status</div>
      )}
    </Modal>
  );
}
