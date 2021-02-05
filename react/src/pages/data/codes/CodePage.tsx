import { ButtonGroup, Typography } from '@material-ui/core';
import { NotificationMessage } from 'components/common';
import Button from 'components/form/Button';
import Table from 'components/table/Table';
import { CodeStrings as S } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import React, { useState } from 'react';
import { ICodeHeader } from 'types/code';
import { formatAxiosError } from 'utils/common';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditCodeHeader from 'pages/data/codes/EditCodeHeader';
import { useDataStyles } from 'pages/data/common/data_styles';

const CodePage: React.FC = () => {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();
  const [codeHeader, setCodeHeader] = useState<ICodeHeader>({} as ICodeHeader);
  const [title, setTitle] = useState<string>('');
  const props = ['id', 'code', 'description'];

  const onSuccess = (data: ICodeHeader[]): void => {
    // do nothing
  };

  const handleClick = (c: ICodeHeader): void => {
    setCodeHeader(c);
    setTitle(c.title);
  };

  const { isFetching, isLoading, isError, error, data } = (bctwApi.useCodeHeaders as any)({ onSuccess });

  const importProps = {
    iMsg: S.importText,
    iTitle: S.importTitle
  };

  return (
    <>
      {isFetching | isLoading ? (
        <div>loading...</div>
      ) : isError ? (
        <NotificationMessage type='error' message={formatAxiosError(error)} />
      ) : (
        <>
          <Typography align='center' variant='h6'>
            <strong>Code Management</strong>
          </Typography>
          <ButtonGroup>
            {data.map((c: ICodeHeader) => {
              return (
                <Button key={c.id} onClick={(): void => handleClick(c)}>
                  {c.title}
                </Button>
              );
            })}
          </ButtonGroup>
          {codeHeader ? (
            <Table
              headers={props}
              title={`${title} Codes`}
              queryProps={{ query: 'useCodes', queryParam: codeHeader?.type ?? 'region' }}
              onSelect={null}
            />
          ) : (
            <div></div>
          )}
          <div className={classes.mainButtonRow}>
            <ExportImportViewer {...importProps} data={[]} eDisabled={true} />
            <AddEditViewer<ICodeHeader>
              editing={codeHeader}
              empty={(): ICodeHeader => {
                return {} as ICodeHeader;
              }}>
              <EditCodeHeader />
            </AddEditViewer>
          </div>
        </>
      )}
    </>
  );
};

export default CodePage;
