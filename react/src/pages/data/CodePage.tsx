import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICodeHeader } from 'types/code';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';
import { formatAxiosError } from 'utils/common';
import { NotificationMessage } from 'components/common';

const CodePage: React.FC = () => {
  const bctwApi = useTelemetryApi();
  const [codeName, setCodeName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const props = ['id', 'code', 'description'];

  const onSuccess = (data: ICodeHeader[]): void => {
    // do nothing
  }

  const handleClick = (c: ICodeHeader): void => {
    setCodeName(c.type);
    setTitle(c.title)
  }
  
  const { isFetching, isLoading, isError, error, data } =
    (bctwApi.useCodeHeaders as any)({ onSuccess });
  return (
    <>
      {isFetching | isLoading ? <div>loading...</div>
        : isError ? <NotificationMessage type='error' message={formatAxiosError(error)} />
          :
          <>
            <Typography align='center' variant='h6'>Code Management</Typography>
            <ButtonGroup>
              {data.map((c: ICodeHeader) => {
                return <Button key={c.id} onClick={(): void => handleClick(c)}>{c.title}</Button>
              })}
            </ButtonGroup>
            {
              codeName ?
                <Table
                  headers={props}
                  title={`${title} Codes`}
                  queryProps={{ query: 'useCodes', queryParam: codeName }}
                  onSelect={null}
                  paginate={false}
                /> : null
            }
          </>
      }
    </>
  )
}

export default CodePage;