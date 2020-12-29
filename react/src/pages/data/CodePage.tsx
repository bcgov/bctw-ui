import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICodeHeader } from 'types/code';
import { ButtonGroup } from '@material-ui/core';
import Button from 'components/form/Button';
import { formatAxiosError } from 'utils/common';
import { NotificationMessage } from 'components/common';
import ImportExportViewer from './bulk/ExportImportViewer';
import { CodeStrings as S } from 'constants/strings';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  empty: {
    display: 'block',
    minHeight: '50vh',
    width: '100vh',
  },
},
);

const CodePage: React.FC = () => {
  const classes = useStyles();
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
  
  const { isFetching, isLoading, isError, error, data } = (bctwApi.useCodeHeaders as any)({ onSuccess });

  const importProps = {
    iMsg: S.importText,
    iTitle: S.importTitle,
  }

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
                /> : <div className={classes.empty}></div>
            }
            <ImportExportViewer {...importProps} data={[]} eDisabled={true} />
          </>
      }
    </>
  )
}

export default CodePage;