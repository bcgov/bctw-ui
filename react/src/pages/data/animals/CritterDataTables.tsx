import Box from '@mui/material/Box';
import Icon from 'components/common/Icon';
import DataTable from 'components/table/DataTable';
import { CritterStrings, CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import { useEffect, useRef, useState } from 'react';
import { QueryStatus } from 'react-query';
import { Animal, AttachedAnimal } from 'types/animal';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import ModifyCritterWrapper from './ModifyCritterWrapper';

import { ActionsMenu } from 'components/common/ActionsMenu';
import { useHistory } from 'react-router-dom';
import { CollarHistory } from 'types/collar_history';
import { WorkflowType } from 'types/events/event';
import { CritterWorkflow } from '../events/CritterWorkflow';
import { AttachRemoveDevice } from './AttachRemoveDevice';
import MapModal from 'components/modal/MapModal';
import dayjs from 'dayjs';
import { Button, Container } from '@mui/material';
import { buttonProps } from 'components/component_constants';
import { Tooltip } from 'components/common';
import FullScreenDialog from 'components/modal/DialogFullScreen';

export const CritterDataTables = ({detailViewAction}): JSX.Element => {
  const api = useTelemetryApi();
  const [attachedAnimalData, setAttachedAnimalData] = useState<AttachedAnimal[]>([]);
  const [animalData, setAnimalData] = useState<Animal[]>([]);

  //const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as AttachedAnimal);
  const editObj = useRef<Animal | AttachedAnimal>({} as AttachedAnimal);
  const setEditObj = (a: AttachedAnimal) => editObj.current = a;
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');

  // Modal Open States
  const [openEdit, setOpenEdit] = useState(false);
  const [openAttachRemoveCollar, setOpenAttachRemoveCollar] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [openAddAnimal, setOpenAddAnimal] = useState(false);

  const handleSelect = <T extends Animal>(row: T): void => {
    //setEditObj(row);
    detailViewAction(row);
  }
  const lastDt = editObj?.current.last_transmission_date;

  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
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

  const Status = (row: AttachedAnimal, idx: number): JSX.Element => {
    if(row.last_fetch_date.isValid()) {
      return (
      <Tooltip title="BCTW is receiving telemetry for this animal's device">
        <Icon size={1.5} icon='signal'></Icon>
      </Tooltip>
      );
    }
    else {
      return (<></>);
    }
  }

  const Menu = (row: AttachedAnimal, idx: number): JSX.Element => {
    const { edit, map, attach, mortality, removeCollar } = CritterStrings.menuItems;
    const _edit = () => setOpenEdit(true);
    const _map = () => setOpenMap(true);

    const _removeAttach = () => {
      setOpenAttachRemoveCollar(true);
    };
    const _mortality = () => {
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
      /*{
        label: map,
        icon: <Icon icon={'location'} />,
        handleClick: _map
      },*/
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
        //disabled={row !== editObj}
        menuItems={
          row instanceof AttachedAnimal ? [...defaultItems, ...attachedItems] : [...defaultItems, ...animalItems]
        }
        onOpen={() => {
          setEditObj(row);
        } }
      />
    );
  };

  const handleAddAnimal = (): void => {
    setOpenAddAnimal((a) => !a);
  };

  return (
    <RowSelectedProvider>
      {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
      <>
        <Box mb={4}>
          <DataTable
            headers={AttachedAnimal.attachedCritterDisplayProps}
            queryProps={{
              query: api.useAssignedCritters,
              onNewData: (data: AttachedAnimal[]) => setAttachedAnimalData(data)
            }}
            disableHighlightOnSelect
            onSelect={handleSelect}
            deleted={deleted}
            updated={updated}
            title={CritterStrings.collaredAnimals}
            customColumns={[{ column: Menu, header: <b>Actions</b>}, {column: Status, header: <p>Status</p>, prepend: true} ]}
            allRecords
            exporter={
              <>
                <ExportViewer<AttachedAnimal>
                  template={AttachedAnimal.attachedCritterDisplayProps}
                  eTitle={CritterStrings.exportTitle}
                  data={attachedAnimalData}
                />
              </>
            }
          />
        </Box>
        <Box mb={4}>
          <DataTable
            headers={new Animal().displayProps}
            //title={CS.unassignedTableTitle}
            disableHighlightOnSelect
            queryProps={{ query: api.useUnassignedCritters, onNewData: (data: Animal[]) => setAnimalData(data) }}
            onSelect={handleSelect}
            updated={updated}
            deleted={deleted}
            title={CritterStrings.nonCollaredAnimals}
            customColumns={[{ column: Menu, header: <b>Actions</b> }]}
            allRecords
            exporter={
              <>
                <Box ml={1}>
                  <Button
                    {...buttonProps}
                    onClick={handleAddAnimal}
                    variant='contained'
                    startIcon={<Icon icon='plus' />}>
                    Add
                  </Button>
                </Box>
                <ExportViewer<Animal>
                  template={new Animal().displayProps}
                  eTitle={CritterStrings.exportTitle}
                  data={animalData}
                />
              </>
            }
          />
        </Box>

        {/* Displays the recent animal telemetry map modal */}
        <MapModal
          title={`Recent Animal Movement`}
          open={openMap}
          handleClose={(v: boolean) => setOpenMap(v)}
          startDate={lastDt && lastDt.isValid() ? lastDt.subtract(24, 'weeks') : dayjs().subtract(24, 'weeks')}
          endDate={lastDt && lastDt.isValid() ? lastDt : dayjs()}
          width={'800px'}
          height={'600px'}
          critter_id={editObj?.current.critter_id}
        />

        {/* Wrapper for Adding Animal, could probably be moved into bottom wrapper. */}
        <ModifyCritterWrapper
          editing={new AttachedAnimal()}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter {...editProps} isCreatingNew={true} open={openAddAnimal} handleClose={handleAddAnimal} />
        </ModifyCritterWrapper>

        {/* Wrapper to allow editing of Attached and Unattached animals */}
        <ModifyCritterWrapper
          editing={editObj?.current}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
        </ModifyCritterWrapper>

        {/* Modal for assigning or removing a device from a critter */}
        <AttachRemoveDevice
          critter_id={editObj?.current.critter_id}
          permission_type={editObj?.current.permission_type}
          current_attachment={new CollarHistory()}
          openModal={openAttachRemoveCollar}
          handleShowModal={setOpenAttachRemoveCollar}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
        />

        {/* Modal for critter workflows */}
        <CritterWorkflow editing={editObj?.current} workflow={'mortality'} open={openWorkflow} setOpen={setOpenWorkflow} />
      </>
    </RowSelectedProvider>
  );
};
