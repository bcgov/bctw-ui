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
import { AttachedCritter, Critter, Critters } from 'types/animal';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import ModifyCritterWrapper from './ModifyCritterWrapper';

import { Button, Tooltip } from 'components/common';
import { ActionsMenu } from 'components/common/ActionsMenu';
import { ConditionalWrapper } from 'components/common/ConditionalWrapper';
import { buttonProps } from 'components/component_constants';
import { CollarHistory } from 'types/collar_history';
import { CritterWorkflow } from '../events/CritterWorkflow';
import { AttachRemoveDevice } from './AttachRemoveDevice';
import { WorkflowType } from 'types/events/event';

export const CritterDataTables = ({ detailViewAction }): JSX.Element => {
  const api = useTelemetryApi();
  const [attachedAnimalData, setAttachedAnimalData] = useState<AttachedCritter[]>([]);
  const [animalData, setAnimalData] = useState<Critter[]>([]);

  const [editObj, setEditObj] = useState<Critters>(new AttachedCritter());
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');

  // Modal Open States
  const [openEdit, setOpenEdit] = useState(false);
  const [openAttachRemoveCollar, setOpenAttachRemoveCollar] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowType>('mortality');
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [openAddAnimal, setOpenAddAnimal] = useState(false);

  const handleSelect = <T extends Critter>(row: T): void => {
    //setEditObj(row);
    detailViewAction(row);
  };
  const handleSelectTemp = <T extends Critter>(row: T[]): void =>
    setEditObj(row.length ? row[0] : new AttachedCritter());
  //const lastDt = editObj?.last_transmission_date;

  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing
  };

  const addEditProps = {
    editing: null,
    empty: new AttachedCritter(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus,
    disableEdit: true,
    disableDelete: true,
    modalControl: true
  };

  const Status = (row: AttachedCritter, idx: number): JSX.Element => {
    if (row.last_fetch_date.isValid()) {
      return (
        <Tooltip title="BCTW is receiving telemetry for this animal's device">
          <Icon size={1.5} icon='signal'></Icon>
        </Tooltip>
      );
    }
    return null;
  };

  const Menu = (row: Critters, idx: number, attached: boolean): JSX.Element => {
    const { edit, map, attach, mortality, removeCollar, capture } = CritterStrings.menuItems;
    const rowNotMerged = row?._merged === false;
    const _edit = () => setOpenEdit(true);
    const _map = () => setOpenMap(true);

    const handleWorkflow = (wf: WorkflowType): void => {
      setWorkflow(wf);
      setOpenWorkflow(true);
    };
    const _removeAttach = (): void => {
      setOpenAttachRemoveCollar(true);
    };
    const _mortality = (): void => {
      handleWorkflow('mortality');
    };
    const _capture = (): void => {
      handleWorkflow('capture');
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
        label: capture,
        icon: <Icon icon={'edit'} />,
        handleClick: _capture
      },
      {
        label: removeCollar,
        icon: <Icon icon={'delete'} />,
        handleClick: _removeAttach
      }
    ];
    return (
      <ConditionalWrapper
        condition={rowNotMerged}
        wrapper={(children) => <Tooltip title={'No Critterbase reference found'}>{children}</Tooltip>}>
        <ActionsMenu
          disabled={rowNotMerged}
          menuItems={attached ? [...defaultItems, ...attachedItems] : [...defaultItems, ...animalItems]}
          onOpen={() => {
            setEditObj(row);
          }}
        />
      </ConditionalWrapper>
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
            headers={AttachedCritter.attachedCritterDisplayProps}
            queryProps={{
              query: api.useAssignedCritters,
              onNewData: (data: AttachedCritter[]): void => setAttachedAnimalData(data),
              defaultSort: {
                property: '_merged',
                order: 'desc'
              }
            }}
            onSelect={handleSelect}
            deleted={deleted}
            updated={updated}
            title={CritterStrings.collaredAnimals}
            customColumns={[
              { column: (row, idx): JSX.Element => Menu(row, idx, true), header: <b>Actions</b> },
              { column: Status, header: <div>Status</div>, prepend: true }
            ]}
            exporter={
              <ExportViewer<AttachedCritter>
                template={AttachedCritter.attachedCritterExportProps}
                eTitle={CritterStrings.exportTitle}
                data={attachedAnimalData}
              />
            }
            paginationFooter
          />
        </Box>

        <Box mb={4}>
          <DataTable
            headers={new Critter().displayProps}
            queryProps={{ query: api.useUnassignedCritters, onNewData: (data: Critter[]): void => setAnimalData(data) }}
            updated={updated}
            deleted={deleted}
            title={CritterStrings.nonCollaredAnimals}
            customColumns={[{ column: (row, idx): JSX.Element => Menu(row, idx, false), header: <b>Actions</b> }]}
            paginationFooter
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
                <ExportViewer<Critter>
                  template={new Critter().displayProps}
                  eTitle={CritterStrings.exportTitle}
                  data={animalData}
                />
              </>
            }
          />
        </Box>

        {/* Displays the recent animal telemetry map modal */}
        {/*<MapModal
          title={`Recent Critter Movement`}
          open={openMap}
          handleClose={(v: boolean) => setOpenMap(v)}
          startDate={lastDt && lastDt.isValid() ? lastDt.subtract(24, 'weeks') : dayjs().subtract(24, 'weeks')}
          endDate={lastDt && lastDt.isValid() ? lastDt : dayjs()}
          width={'800px'}
          height={'600px'}
          critter_id={editObj?.current.critter_id}
          />*/}

        {/* Wrapper for Adding Critter, could probably be moved into bottom wrapper. */}
        <ModifyCritterWrapper
          editing={new AttachedCritter()}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter {...editProps} isCreatingNew={true} open={openAddAnimal} handleClose={handleAddAnimal} />
        </ModifyCritterWrapper>

        {/* Wrapper to allow editing of Attached and Unattached animals */}
        <ModifyCritterWrapper
          editing={editObj}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
        </ModifyCritterWrapper>

        {/* Modal for assigning or removing a device from a critter */}
        <AttachRemoveDevice
          critter_id={editObj.critter_id}
          permission_type={editObj?.permission_type}
          current_attachment={new CollarHistory()}
          openModal={openAttachRemoveCollar}
          handleShowModal={setOpenAttachRemoveCollar}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
        />

        {/* Modal for critter workflows */}
        <CritterWorkflow editing={editObj} workflow={workflow} open={openWorkflow} setOpen={setOpenWorkflow} />
      </>
    </RowSelectedProvider>
  );
};
