import { CircularProgress } from '@mui/material';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import dayjs from 'dayjs';
import download from 'downloadjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useState } from 'react';
import { formatT } from 'utils/time';

type ImportProps<T> = ModalBaseProps & { template: (keyof T)[]; data: T[] };

export default function Export<T>({ handleClose, open, template, title, data }: ImportProps<T>): JSX.Element {
  // const api = useTelemetryApi();
  const [downloading, setIsDownloading] = useState(false);
  const fields = template.join(',');

  useDidMountEffect(() => {
    if (open) {
      setIsDownloading(true);
      exportData();
    }
  }, [open]);

  const exportData = (): void => {
    //const data = [...aResults, ...uResults];
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
      {!data?.length ? (
        <div>error retrieving data...</div>
      ) : downloading ? (
        <div>
          downloading...
          <CircularProgress />
        </div>
      ) : (
        <div>no status</div>
      )}
    </Modal>
  );
}
