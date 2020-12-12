import React, {useState, useEffect} from 'react';
import { useMutation } from 'react-query';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Button, ButtonGroup, Typography } from '@material-ui/core';
import { hasCollarCurrentlyAssigned } from 'types/collar';
import { getNow } from 'utils/time';
import { AxiosError } from 'axios';

type IAssignmentHistoryProps = {
  animalId: number;
  deviceId?: number;
  isEdit: boolean;
};

export default function AssignmentHistory(props: IAssignmentHistoryProps) {
  const {animalId, isEdit, deviceId } = props;
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const bctwApi = useTelemetryApi();
  const { isLoading, isError, isFetching, error, data } = bctwApi.useCollarHistory(animalId);

  const handleSelect = () => {};

  useEffect(() => {
    const u = () => {
      if (data && data.length) {
        setHasCollar(hasCollarCurrentlyAssigned(data));
      }
    }
    u();
  }, [data])

  if (isLoading || isFetching) {
    return <div>loading collar assignment details...</div>
  } else if (isError) {
    return <div>{`error ${error.response.data}`}</div>
  } else if (!data?.length) {
    return null;
  }
  return (
    <>
      <Typography variant='h6'>Collar Assignment History</Typography>
      <Table
        onSelect={handleSelect}
        headers={['device_id', 'make', 'start_time', 'end_time']}
        data={data}
      />
      <PerformAssignment hasCollar={hasCollar} {...props} />
    </>
  )
}

type IPerformAssignmentProps = {
  hasCollar: boolean;
  animalId: number;
  deviceId?: number;
}

/**
 * component that performs the post request to assign/unassign a collar
 */
const PerformAssignment: React.FC<IPerformAssignmentProps> = (props) => {
  const { hasCollar, animalId, deviceId } = props;
  const bctwApi = useTelemetryApi();
  const [ mutate, {isError, isLoading, isSuccess, error, data}] = useMutation<any, AxiosError>(bctwApi.linkCollar);

  const handleClick = () => hasCollar ? removeCollar() : assignCollar();
  const assignCollar = async() => { 
  }
  const removeCollar = async() => {
    const body = {
      isLink: hasCollar,
      data: {
        animal_id: animalId,
        device_id: deviceId,
        start_date: getNow()
      }
    }
    await mutate(body as any)
  };

  return (
    <>
      <ButtonGroup size='small' variant='contained' color='primary'>
        <Button onClick={handleClick}>{hasCollar ? 'unassign collar' : 'assign collar'}</Button>
      </ButtonGroup>
      {
        isError 
          ? <p>error {error.response.data}</p>
          : <p>{JSON.stringify(data)}</p>
      }
    </>
  )
}
