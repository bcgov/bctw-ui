import { IUpsertPayload } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { SnackbarWrapper } from 'components/common';
import { INotificationMessage } from 'components/component_interfaces';
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

  // must be defined before mutation declaration
  const onSuccess = async (data: Animal[]): Promise<void> => {
    const critter = data[0];
    updateStatus({ type: 'success', message: `${critter.animal_id ?? critter.nickname ?? 'critter'} saved!` });

    let unassignedQueryKey;
    let isCritterMatch = false;
    queryClient.invalidateQueries({
      predicate: (query) => {
        if ((query.queryKey[0] as string).indexOf('critter') === -1) {
          return false;
        }
        // save this query in case we cant find a matching critter to update
        if (query.queryKey[0] === 'u_critters') {
          unassignedQueryKey = query.queryKey;
        }
        const staleData = query.state.data as Animal[];
        const found = staleData.find((a) => a.id === critter.id);
        // invalidate the list of critters containing the updated one
        if (found) {
          isCritterMatch = true;
          return true;
        }
        return false;
      }
    });
    // if a new critter was added, invalidate unassigned critters data
    if (!isCritterMatch && unassignedQueryKey) {
      queryClient.invalidateQueries(unassignedQueryKey);
    }
  };

  const onError = (error: AxiosError): void =>
    updateStatus({ type: 'error', message: `error saving animal: ${formatAxiosError(error)}` });

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
  };

  // setup the post mutation
  const { mutateAsync } = (bctwApi.useMutateCritter as any)({ onSuccess, onError });

  // critter properties that are displayed as select inputs
  const selectableProps = CS.editableProps.slice(3, 7);

  const handleSelect = (row: Animal): void => {
    setEditObj(row);
    props.setSidebarContent(<p>id: {row.id}</p>);
  };

  const save = async (a: IUpsertPayload<Animal>): Promise<Animal[]> => await mutateAsync(a);

  // props to be passed to the edit modal component
  const editProps = {
    editableProps: CS.editableProps,
    editing: new Animal(),
    open: false,
    onSave: save,
    selectableProps
  };

  const ieProps = {
    eMsg: CS.exportText,
    eTitle: CS.exportTitle,
    iTitle: CS.importTitle,
    iMsg: CS.importText
  };

  return (
    <SnackbarWrapper>
      <div className={classes.container}>
        <Table
          headers={assignedCritterProps}
          title={CS.assignedTableTitle}
          queryProps={{ query: 'useAssignedCritters', onNewData: (d: Animal[]): void => setCrittersA(d) }}
          onSelect={handleSelect}
        />
        <Table
          headers={unassignedCritterProps}
          title={CS.unassignedTableTitle}
          queryProps={{ query: 'useUnassignedCritters', onNewData: (d: Animal[]): void => setCrittersU(d) }}
          onSelect={handleSelect}
        />

        <div className={classes.mainButtonRow}>
          <ExportImportViewer {...ieProps} data={[...critterA, ...critterU]} />

          <AddEditViewer<Animal> editing={editObj} empty={(): Animal => new Animal()}>
            <EditCritter {...editProps} />
          </AddEditViewer>
        </div>
      </div>
    </SnackbarWrapper>
  );
}
