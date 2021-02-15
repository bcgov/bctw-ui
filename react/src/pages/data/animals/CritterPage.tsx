import { IDeleteType, IUpsertPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { SnackbarWrapper } from 'components/common';
import Table from 'components/table/Table';
import { CritterStrings as CS } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportImportViewer from 'pages/data/bulk/ExportImportViewer';
import AddEditViewer from 'pages/data/common/AddEditViewer';
import { useDataStyles } from 'pages/data/common/data_styles';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Animal, assignedCritterProps, unassignedCritterProps } from 'types/animal';
import { formatAxiosError } from 'utils/common';
import ModifyCritterWrapper from './ModifyCritterWrapper';

type CritterPageProps = {
  setSidebarContent?: (component: JSX.Element) => void;
};
export default function CritterPage(props: CritterPageProps): JSX.Element {
  const classes = useDataStyles();
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const queryClient = useQueryClient();

  const [editObj, setEditObj] = useState<Animal>({} as Animal);

  const [critterA, setCrittersA] = useState<Animal[]>([]);
  const [critterU, setCrittersU] = useState<Animal[]>([]);

  // must be defined before mutation declarations
  const onSuccess = async (data: Animal[] | Animal): Promise<void> => {
    const critter = Array.isArray(data) ? data[0] : data;
    responseDispatch({ type: 'success', message: `${critter.name} saved!` });
    invalidateCritterQueries();
  };

  const onDelete = async (): Promise<void> => {
    responseDispatch({ type: 'success', message: `critter deleted successfully` });
    invalidateCritterQueries();
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  // force refetch on critter queries
  const invalidateCritterQueries = async (): Promise<void> => {
    queryClient.invalidateQueries('critters_assigned');
    queryClient.invalidateQueries('critters_unassigned');
  };

  // setup the mutations
  const { mutateAsync: saveMutation } = bctwApi.useMutateCritter({ onSuccess, onError });
  const { mutateAsync: deleteMutation } = bctwApi.useDelete({ onSuccess: onDelete, onError });

  // critter properties that are displayed as select inputs
  const selectableProps = CS.editableProps.slice(3, 7);

  const handleSelect = (row: Animal): void => {
    setEditObj(row);
    // todo: remove when navigating away from page
    props.setSidebarContent(<p>id: {row.id}</p>);
  };

  const saveCritter = async (a: IUpsertPayload<Animal>): Promise<Animal[]> => await saveMutation(a);
  const deleteCritter = async (critterId: string): Promise<void> => {
    const payload: IDeleteType = {
      id: critterId,
      objType: 'animal'
    };
    await deleteMutation(payload);
  };

  // props to be passed to the edit modal component
  const editProps = {
    editableProps: CS.editableProps,
    editing: new Animal(),
    open: false,
    onSave: saveCritter,
    selectableProps
  };

  const ieProps = {
    eMsg: CS.exportText,
    eTitle: CS.exportTitle,
    iTitle: CS.importTitle,
    iMsg: CS.importText
  };

  return (
    <div className={classes.container}>
      <Table
        headers={assignedCritterProps}
        title={CS.assignedTableTitle}
        queryProps={{ query: bctwApi.useAssignedCritters, onNewData: (d: Animal[]): void => setCrittersA(d) }}
        onSelect={handleSelect}
      />
      <Table
        headers={unassignedCritterProps}
        title={CS.unassignedTableTitle}
        queryProps={{ query: bctwApi.useUnassignedCritters, onNewData: (d: Animal[]): void => setCrittersU(d) }}
        onSelect={handleSelect}
      />
      <div className={classes.mainButtonRow}>
        <ExportImportViewer {...ieProps} data={[...critterA, ...critterU]} />
        <ModifyCritterWrapper editing={editObj} onDelete={deleteCritter}>
          <AddEditViewer<Animal> editing={editObj} empty={(): Animal => new Animal()}>
            <EditCritter {...editProps} />
          </AddEditViewer>
        </ModifyCritterWrapper>
      </div>
    </div>
  );
}
