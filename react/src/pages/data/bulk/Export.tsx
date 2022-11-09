import { CircularProgress } from '@mui/material';
import { AxiosError } from 'axios';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import { ITableQueryProps } from 'components/table/table_interfaces';
import dayjs from 'dayjs';
import download from 'downloadjs';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { UseQueryResult } from 'react-query';
import { Animal, AttachedAnimal } from 'types/animal';
import { formatT } from 'utils/time';

type ImportProps<T> = ModalBaseProps & { template: (keyof T)[]; data: T[] };

export default function Export<T, J>({ handleClose, open, template, title, data }: ImportProps<T>): JSX.Element {
  // const api = useTelemetryApi();
  const [downloading, setIsDownloading] = useState(false);
  const fields = template.join(',');
  //const [results, setResults] = useState([]);

  //const { query, param, onNewData, defaultSort } = queryProps;

  // const [aResults, setAResults] = useState([]);
  // const [uResults, setUResults] = useState([]);

  // fixme: better way to determine which page
  // const isCritter = template[0] === 'critter_id';
  // const templateString = JSON.stringify(template);
  // const isUnattachedCritter = templateString === JSON.stringify(new Animal().displayProps);
  // const isAttachedCritter = templateString === JSON.stringify(AttachedAnimal.attachedCritterDisplayProps);
  //Old code
  // const {
  //   isError: isAError,
  //   data: aData,
  //   status: aStatus
  // } = isAttachedCritter ? api.useAssignedCritters(0) : api.useAttachedDevices(0);
  // const {
  //   isError: isUError,
  //   data: uData,
  //   status: uStatus
  // } = isUnattachedCritter ? api.useUnassignedCritters(0) : api.useUnattachedDevices(0);

  //const { isFetching, isLoading, isError, data, isPreviousData, isSuccess } = query();

  // useDidMountEffect(() => {
  //   if (isSuccess && !isError) {
  //     setResults(data);
  //   }
  //   // if (uStatus === 'success' && !isUError) {
  //   //   setUResults(uData);
  //   // }
  // }, [isSuccess]);

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
