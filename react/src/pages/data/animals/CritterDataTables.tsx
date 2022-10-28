import Box from '@mui/material/Box';
import Icon from 'components/common/Icon';
import DataTable from 'components/table/DataTable';
import { CritterStrings, CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import { useState } from 'react';
import { QueryStatus } from 'react-query';
import { Animal, AttachedAnimal } from 'types/animal';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import ModifyCritterWrapper from './ModifyCritterWrapper';

import { ActionsMenu } from 'components/common/partials/ActionsMenu';
import { useHistory } from 'react-router-dom';
import { CollarHistory } from 'types/collar_history';
import { WorkflowType } from 'types/events/event';
import { CritterWorkflow } from '../events/CritterWorkflow';
import { AttachRemoveDevice } from './AttachRemoveDevice';
import MapModal from 'components/modal/MapModal';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import { buttonProps } from 'components/component_constants';

export const CritterDataTables = (): JSX.Element => {
  const api = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as AttachedAnimal);
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');

  // Modal Open States
  const [openEdit, setOpenEdit] = useState(false);
  const [openAttachRemoveCollar, setOpenAttachRemoveCollar] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openMap, setOpenMap] = useState(false);

  const [workflowType, setWorkflowType] = useState<WorkflowType>();

  const handleSelect = <T extends Animal>(row: T): void => setEditObj(row);

  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing,
    workflow: workflowType
  };

  const addEditProps = {
    editing: null,
    empty: new AttachedAnimal(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus,
    disableEdit: true,
    disableDelete: true,
    modalControl: true
  };

  const Menu = (row: AttachedAnimal, idx: number): JSX.Element => {
    const { edit, map, attach, mortality, removeCollar } = CritterStrings.menuItems;
    const _edit = () => setOpenEdit(true);
    const _map = () => setOpenMap(true);
    const _removeAttach = () => {
      setOpenAttachRemoveCollar(true);
    };
    const _mortality = () => {
      setWorkflowType('mortality');
      setOpenWorkflow(true);
    };
    const defaultItems = [
      {
        label: edit,
        icon: <Icon icon={'edit'} />,
        handleClick: _edit
      }
    ];
    const animalItems = [
      {
        label: attach,
        icon: <Icon icon={'edit'} />,
        handleClick: _removeAttach
      }
    ];
    const attachedItems = [
      {
        label: map,
        icon: <Icon icon={'location'} />,
        handleClick: _map
      },
      {
        label: mortality,
        icon: <Icon icon={'dead'} />,
        handleClick: _mortality
      },
      {
        label: removeCollar,
        icon: <Icon icon={'delete'} />,
        handleClick: _removeAttach
      }
    ];
    return (
      <ActionsMenu
        disabled={row !== editObj}
        menuItems={
          row instanceof AttachedAnimal ? [...defaultItems, ...attachedItems] : [...defaultItems, ...animalItems]
        }
      />
    );
  };
  return (
    <RowSelectedProvider>
      {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
      <>
        <Box mb={4}>
          <DataTable
            headers={AttachedAnimal.attachedCritterDisplayProps}
            queryProps={{ query: api.useAssignedCritters }}
            onSelect={handleSelect}
            deleted={deleted}
            updated={updated}
            title={CritterStrings.collaredAnimals}
            customColumns={[{ column: Menu, header: <b>Actions</b> }]}
            exporter={
              <>
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
            updated={updated}
            deleted={deleted}
            title={CritterStrings.nonCollaredAnimals}
            customColumns={[{ column: Menu, header: <b>Actions</b> }]}
            exporter={
              <>
                {/* <ModifyCritterWrapper
                    editing={editObj}
                    onUpdate={(critter_id: string): void => setUpdated(critter_id)}
                    setCritter={setEditObj}>
                    <AddEditViewer<Animal> {...addEditProps}>
                      <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
                    </AddEditViewer>
                  </ModifyCritterWrapper> */}
                <Button {...buttonProps}>Export</Button>
                <ExportViewer<Animal>
                  template={[
                    'critter_id',
                    'species',
                    'population_unit',
                    'wlh_id',
                    'animal_id',
                    'animal_id',
                    'animal_status'
                  ]}
                  eTitle={CritterStrings.exportTitle}
                />
              </>
            }
          />
        </Box>
        <MapModal
          title={`Recent Animal Movement`}
          open={openMap}
          handleClose={(v: boolean) => setOpenMap(v)}
          width={'800px'}
          height={'600px'}
          critter_id={editObj.critter_id}
        />

        {/* Wrapper to allow editing of Attached and Unattached animals */}

        <ModifyCritterWrapper
          editing={new AttachedAnimal()}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter {...editProps} isCreatingNew open={openEdit} handleClose={() => setOpenEdit(false)} />
        </ModifyCritterWrapper>

        {/* Modal for assigning or removing a device from a critter */}
        <AttachRemoveDevice
          critter_id={editObj.critter_id}
          permission_type={editObj.permission_type}
          current_attachment={new CollarHistory()}
          openModal={openAttachRemoveCollar}
          handleShowModal={setOpenAttachRemoveCollar}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
        />
        {/* Modal for critter workflows */}
        <CritterWorkflow editing={editObj} workflow={workflowType} open={openWorkflow} setOpen={setOpenWorkflow} />
      </>
    </RowSelectedProvider>
  );
};
