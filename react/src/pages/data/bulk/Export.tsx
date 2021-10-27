import { Chip, Typography } from '@mui/material';
import { Button, Modal } from 'components/common';
import { ExportImportProps } from 'components/component_interfaces';
import dayjs from 'dayjs';
import download from 'downloadjs';
import { useEffect, useState } from 'react';
import { omitNull } from 'utils/common_helpers';
import { formatT } from 'utils/time';

import bulkStyles from './bulk_styles';

type ImportProps<T> = ExportImportProps & { data: T[] };

export default function Export<T>({ data, message, title, open, handleClose }: ImportProps<T>): JSX.Element {
  const styles = bulkStyles();
  const [included, setIncluded] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);

  useEffect(() => {
    if (open === true) {
      reset();
    }
  }, [open]);

  const getTypeExportFields = (a: T): string[] => Object.keys(omitNull(a));

  const add = (item: string): void => {
    const removed = excluded.splice(excluded.indexOf(item), 1)[0];
    setIncluded((old) => [...old, ...[removed]]);
  };

  const remove = (item: string): void => {
    const added = included.splice(included.indexOf(item), 1)[0];
    setExcluded((old) => [...old, ...[added]]);
  };

  const exportData = (): void => {
    const body = data.map(d => {
      let r = '';
      for (let i = 0; i < included.length; i++) {
        const key = included[i];
        const value = d[key];
        if (value) {
          r += value;
        }
        r += i !== included.length -1 ? ',' : '\n'; 
      }
      return r;
    }).join('');
    download(`${included}\n${body}`, `export_${formatT(dayjs())}.csv`, 'csv');
  };

  const uncheckAll = (): void => setExcluded([...excluded, ...included.splice(0)]);

  const reset = (): void => {
    if (data && data.length) {
      setIncluded([...getTypeExportFields(data[0])]);
    }
    setExcluded([]);
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <p>{message}</p>
      {data && data.length ? (
        <>
          <Typography className={styles.header} variant='h5'>Included in export:</Typography>
          <div className={styles.exportChipRowParent}>
            {included.map((d, i) => 
              <Chip className={styles.chip} key={`${d}-${i}`} onDelete={(): void => remove(d)} label={d} />
            )}
          </div>
          <Typography className={styles.header} variant='h5'>Excluded in export:</Typography>
          <div className={styles.exportChipRowParent}>
            {excluded.map((d, i) => 
              <Chip className={styles.chip} key={`${d}-${i}`} onDelete={(): void => add(d)} label={d} color='secondary' />
            )}
          </div>
          <div className={styles.footer}>
            <div>
              <Button disabled={included.length === 0} onClick={uncheckAll}>Remove all</Button>
              <Button disabled={excluded.length === 0} onClick={reset}>Reset</Button>
            </div>
            <Button disabled={included.length <= 0} onClick={exportData}>Download</Button>
          </div>
        </>
      ) : null}
    </Modal>
  );
}
