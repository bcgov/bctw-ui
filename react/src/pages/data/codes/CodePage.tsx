import { ButtonGroup, Typography } from '@material-ui/core';
import { NotificationMessage } from 'components/common';
import Button from 'components/form/Button';
import Table from 'components/table/Table';
import { CodeStrings as S } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import React, { useState } from 'react';
import { ICodeHeader, CodeHeader } from 'types/code';
import { formatAxiosError } from 'utils/common';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditCodeHeader from 'pages/data/codes/EditCodeHeader';
import { useDataStyles } from 'pages/data/common/data_styles';
import { IUpsertPayload } from 'api/api_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

const CodePage: React.FC = () => {
  const classes = useDataStyles();
  const [codeHeader, setCodeHeader] = useState<ICodeHeader>({} as ICodeHeader);
  const [title, setTitle] = useState<string>('');
  const props = ['id', 'code', 'description'];
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data): void => {
    if (data.errors.length) {
      responseDispatch({ type: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const header = data.results[0];
    responseDispatch({ type: 'success', message: `code header ${header.code_header_name} saved` });
    // todo: invalidate code_header query?
  };

  const handleClick = (c: ICodeHeader): void => {
    setCodeHeader(c);
    setTitle(c.title);
  };

  const { mutateAsync } = (bctwApi.useMutateCodeHeader as any)({ onSuccess });

  const handleSave = async (p: IUpsertPayload<CodeHeader>): Promise<void> => await mutateAsync(p.body);

  const { isFetching, isLoading, isError, error, data } = (bctwApi.useCodeHeaders as any)({ onSuccess });

  const importProps = {
    iMsg: S.importText,
    iTitle: S.importTitle
  };

  const editProps = {
    editableProps: S.editableProps,
    editing: new CodeHeader(),
    open: false,
    onSave: handleSave,
    selectableProps: []
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
            <AddEditViewer<ICodeHeader> editing={codeHeader} empty={() => Object.create({})} disableEdit={true}>
              <EditCodeHeader {...editProps} />
            </AddEditViewer>
          </div>
        </>
      )}
    </>
  );
};

export default CodePage;
