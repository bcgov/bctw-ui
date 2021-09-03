import Box from '@material-ui/core/Box';
import Button from 'components/form/Button';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { CollarStrings as S } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCollar from 'pages/data/collars/EditCollar';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useState } from 'react';
import { Collar, eCollarAssignedStatus } from 'types/collar';
import AddEditViewer from '../common/AddEditViewer';
import CollarImport from 'pages/data/collars/CollarImport';
import ModifyCollarWrapper from 'pages/data/collars/ModifyCollarWrapper';

export default function CollarPage(): JSX.Element {
  const bctwApi = useTelemetryApi();

  const [editObj, setEditObj] = useState<Collar>({} as Collar);
  const [showImport, setShowImport] = useState<boolean>(false);

  // set editing object when table row is selected
  const handleSelect = (row: Collar): void => {
    // console.log(`device_id: ${row.device_id} p: ${row.permission_type}`);
    setEditObj(row);
  };

  // pass as callback to table component to set export data when api returns collar data
  // const onNewData = (d: Collar[]): void => {
  //   if (d.length && d[0].animal_id) {
  //     setCollarsA(d);
  //   } else {
  //     setCollarsU(d);
  //   }
  // };

  const editProps = {
    editing: new Collar(),
    open: false,
    onSave: null,
    handleClose: null,
  };

  const tableProps: ITableQueryProps<Collar> = { query: bctwApi.useCollarType, /* onNewData */ };
  
  return (
    <ManageLayout>
      <Box className='manage-layout-titlebar'>
        <h1>My Devices</h1>
        <Box display='flex' alignItems='center'>
          <Box mr={1}>
            <Button size='large' variant='contained' color='primary' onClick={(): void => setShowImport((o) => !o)}>
              Import
            </Button>
          </Box>
          <ModifyCollarWrapper editing={editObj}>
            <AddEditViewer<Collar> editing={editObj} empty={new Collar()}>
              <EditCollar {...editProps} />
            </AddEditViewer>
          </ModifyCollarWrapper>
        </Box>
      </Box>

      <RowSelectedProvider>
        <>
          <Box mb={4}>
            <DataTable
              headers={Collar.attachedPropsToDisplay}
              title={S.assignedCollarsTableTitle}
              queryProps={{ ...tableProps, param: eCollarAssignedStatus.Assigned }}
              onSelect={handleSelect}
            />
          </Box>
          <Box mb='3'>
            <DataTable
              headers={Collar.propsToDisplay}
              title={S.availableCollarsTableTitle}
              queryProps={{ ...tableProps, param: eCollarAssignedStatus.Available }}
              onSelect={handleSelect}
            />
          </Box>
        </>
      </RowSelectedProvider>

      <CollarImport open={showImport} handleClose={(): void => setShowImport(false)} />
    </ManageLayout>
  );
}
