import { ButtonGroup, Typography } from '@mui/material';
import { NotificationMessage } from 'components/common';
import Button from 'components/form/Button';
import DataTable from 'components/table/DataTable';
import { CodeStrings as S } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import React, { useState } from 'react';
import { CodeFormFields, CodeHeader, CodeHeaderInput, ICodeHeader } from 'types/code';
import { formatAxiosError } from 'utils/errors';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import EditCodeHeader from 'pages/data/codes/EditCodeHeader';
import { IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import ManageLayout from 'pages/layouts/ManageLayout';

const CodePage: React.FC = () => {
  const [header, setHeader] = useState('animal_status');
  const [title, setTitle] = useState<string>('');
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const onSuccess = (data): void => {
    if (data.errors.length) {
      responseDispatch({ severity: 'error', message: `${data.errors[0].error}` });
      return;
    }
    const header = data.results[0];
    responseDispatch({ severity: 'success', message: `code header ${header.code_header_name} saved` });
    // todo: invalidate code_header query?
  };

  const handleClick = (c: CodeHeader): void => {
    // setCodeHeader(c);
    setHeader(c.type);
    setTitle(c.title);
  };

  const { mutateAsync } = bctwApi.useSaveCodeHeader({ onSuccess });

  const handleSave = async (p: IUpsertPayload<CodeHeaderInput>): Promise<void> => {
    await mutateAsync(p.body);
  }

  const { isFetching, isLoading, isError, error, data, status } = bctwApi.useCodeHeaders();

  const importProps = {
    iMsg: S.importText,
    iTitle: S.importTitle
  };

  const editProps = {
    editableProps: CodeFormFields.map((s) => s.prop),
    editing: new CodeHeaderInput(),
    open: false,
    onSave: handleSave,
    selectableProps: [],
    handleClose: null
  };

  return (
    <ManageLayout>
      <div className='container'>
        {isFetching || isLoading ? (
          <div>Please wait...</div>
        ) : isError ? (
          <NotificationMessage severity='error' message={formatAxiosError(error)} />
        ) : (
          <>
            <Typography align='center' variant='h6'>
              <strong>Code Management</strong>
            </Typography>
            <ButtonGroup>
              {data.map((c: CodeHeader) => {
                return (
                  <Button key={c.id} onClick={(): void => handleClick(c)}>
                    {c.title}
                  </Button>
                );
              })}
            </ButtonGroup>
            <DataTable
              // fixme: code is not a codeheader
              headers={CodeHeader.getProps() as any}
              title={`${title} Codes`}
              queryProps={{
                query: bctwApi.useCodes,
                param: header,
                // onNewData: (v): void => console.log(JSON.stringify(v[0]), null)
              }}
            />
            <div className='button-row'>
              <ExportImportViewer {...importProps} data={[]} eDisabled={true} />
              <AddEditViewer<CodeHeaderInput>
                queryStatus={status}
                onSave={handleSave}
                editing={new CodeHeaderInput()}
                empty={Object.create({})}
                disableEdit={true}>
                <EditCodeHeader {...editProps} />
              </AddEditViewer>
            </div>
          </>
        )}
      </div>
    </ManageLayout>
  );
};

export default CodePage;
