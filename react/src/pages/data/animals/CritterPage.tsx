import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { BannerStrings, CritterStrings, CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { MutableRefObject, Ref, useEffect, useRef, useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import { QueryStatus } from 'react-query';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import Icon from 'components/common/Icon';
import { Alert, Button, Container, IconButton, Menu, MenuItem, Select, TableCell } from '@mui/material';
import { buttonProps } from 'components/component_constants';
import { attachedAnimalNotification } from 'constants/formatted_string_components';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { UserCritterAccess } from 'types/animal_access';
import { ITableQueryProps } from 'components/table/table_interfaces';
import UserProfile from 'pages/user/UserProfile';
import { UserAnimalAccess } from './UserAnimalAccess';
import { AttachedCollar } from 'types/collar';

import { ErrorBanner, InfoBanner, NotificationBanner, SuccessBanner } from 'components/common/Banner';
import { InfoCard } from 'components/common/InfoCard';
import { QuickSummary } from 'components/common/QuickSummary';
import { ActionsMenu } from 'components/common/partials/ActionsMenu';
import AddEditViewer from '../common/AddEditViewer';
import { useHistory } from 'react-router-dom';
import AssignmentHistory from './AssignmentHistory';
export default function CritterPage(): JSX.Element {
  const api = useTelemetryApi();
  const editDeleteRef = useRef();
  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as Animal);
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');
  const [openManageAnimals, setOpenManageAnimals] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);

  const handleSelect = <T extends Animal>(row: T): void => setEditObj(row);

  const inverseManageModal = (): void => {
    setOpenManageAnimals((a) => !a);
  };
  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
  };

  const addEditProps = {
    editing: new AttachedAnimal(),
    empty: new AttachedAnimal(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus,
    disableAdd: true,
    disableDelete: true,
    modalControl: true
  };

  const Menu = (row: AttachedAnimal, idx: number): JSX.Element => {
    const history = useHistory();
    const edit = () => setOpenEdit(true);
    const map = () => history.push('/map');
    const remove = () => setOpenAssignment(true);
    // const mortality = () => handleOpenWorkflow('mortality');
    return (
      <ActionsMenu
        disabled={row !== editObj}
        menuItems={[
          {
            label: 'Show on Map',
            icon: <Icon icon={'location'} />,
            handleClick: map
          },
          {
            label: 'Report Mortality',
            icon: <Icon icon={'dead'} />
            //handleClick:
          },
          {
            label: 'Edit',
            icon: <Icon icon={'edit'} />,
            handleClick: edit
          },
          {
            label: 'Remove Device',
            icon: <Icon icon={'delete'} />,
            handleClick: remove
          }
        ]}
      />
    );
  };
  return (
    <ManageLayout>
      <SpeciesProvider>
        <Box className='manage-layout-titlebar'>
          <h1>Animals</h1>
          <Box display='flex' alignItems='center'>
            <Button size='medium' variant='outlined' onClick={inverseManageModal}>
              Manage My Animals
            </Button>
            <FullScreenDialog open={openManageAnimals} handleClose={inverseManageModal}>
              <Container maxWidth='xl'>
                <h1>Manage My Animals</h1>
                <UserAnimalAccess />
              </Container>
            </FullScreenDialog>
          </Box>
        </Box>
        <NotificationBanner hiddenContent={[]} />
        <Box mb={4}>
          <QuickSummary />
        </Box>
        {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
        <RowSelectedProvider>
          <>
            <Box mb={4}>
              <DataTable
                headers={AttachedAnimal.attachedCritterDisplayProps}
                //title={CS.assignedTableTitle}
                queryProps={{ query: api.useAssignedCritters }}
                onSelect={handleSelect}
                deleted={deleted}
                updated={updated}
                title={'Collared Animals'}
                customColumns={[{ column: Menu, header: <b>Actions</b> }]}
                exporter={
                  <>
                    <ModifyCritterWrapper
                      editing={editObj}
                      onDelete={(critter_id: string): void => setDeleted(critter_id)}
                      onUpdate={(critter_id: string): void => setUpdated(critter_id)}
                      setCritter={setEditObj}>
                      <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
                    </ModifyCritterWrapper>
                    <ExportViewer<AttachedAnimal>
                      template={[
                        'critter_id',
                        'species',
                        'population_unit',
                        'wlh_id',
                        'animal_id',
                        'collar_id',
                        'device_id',
                        'frequency',
                        'animal_id',
                        'latitude',
                        'longitude'
                      ]}
                      eTitle={CritterStrings.exportTitle}
                    />
                  </>
                }
              />
            </Box>
            <Box mb={4}>
              <DataTable
                headers={new Animal().displayProps}
                //title={CS.unassignedTableTitle}
                queryProps={{ query: api.useUnassignedCritters }}
                onSelect={handleSelect}
                deleted={deleted}
                title={'Non-collared Animals'}
                exporter={
                  <ExportViewer<Animal>
                    template={['critter_id', 'species', 'population_unit', 'wlh_id', 'animal_id', 'animal_id']}
                    eTitle={CritterStrings.exportTitle}
                  />
                }
              />
            </Box>
            <AssignmentHistory
              open={openAssignment}
              handleClose={(): void => setOpenAssignment(false)}
              critter_id={editObj.critter_id}
              permission_type={editObj.permission_type}
            />
          </>
        </RowSelectedProvider>
      </SpeciesProvider>
    </ManageLayout>
  );
}
