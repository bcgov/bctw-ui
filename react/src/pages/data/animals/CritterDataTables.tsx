import Box from '@mui/material/Box';
import Icon from 'components/common/Icon';
import DataTable from 'components/table/DataTable';
import { CritterStrings } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import { useEffect, useState } from 'react';
import { AttachedCritter, Critter, Critters } from 'types/animal';
import { doNothingAsync } from 'utils/common_helpers';
import ModifyCritterWrapper from './ModifyCritterWrapper';

import { Tooltip } from 'components/common';
import { ActionsMenu } from 'components/common/ActionsMenu';
import { ConditionalWrapper } from 'components/common/ConditionalWrapper';
import { CollarHistory } from 'types/collar_history';
import { WorkflowType } from 'types/events/event';
import { CritterWorkflow } from '../events/CritterWorkflow';
import { AttachRemoveDevice } from './AttachRemoveDevice';

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
  const [workflow, setWorkflow] = useState<WorkflowType>('unknown');
  const [openWorkflow, setOpenWorkflow] = useState(false);

  // Keeps track of conditionally rendered columns from collection_units
  const [combinedHeaders, setCombinedHeaders] = useState<(keyof Critter | string)[]>(
    new Critter().displayProps() as (keyof Critter | string)[]
  );

  // Inserts unique collection_unit categories as new column headers
  // TODO: Make this a common helper
  const handleCollectionColumns = (rows: Critter[]): void => {
    const keys = rows.flatMap((row) => row.collectionUnitKeys);
    const uniqueKeys = [...new Set(keys)];
    const baseHeaders = new Critter().displayProps();
    setCombinedHeaders([...baseHeaders.slice(0, 2), ...uniqueKeys, ...baseHeaders.slice(2)]);
  };

  useEffect(() => {
    handleCollectionColumns(animalData);
  }, [animalData]);

  const handleSelect = <T extends Critter>(row: T): void => {
    setEditObj(row);
    detailViewAction(row);
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
    const { edit, attach, mortality, removeCollar, capture } = CritterStrings.menuItems;
    const rowNotMerged = row?._merged === false;
    const _edit = () => setOpenEdit(true);

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
            headers={combinedHeaders as (keyof Critter)[]}
            queryProps={{ query: api.useUnassignedCritters, onNewData: (data: Critter[]): void => setAnimalData(data) }}
            updated={updated}
            deleted={deleted}
            title={CritterStrings.nonCollaredAnimals}
            customColumns={[{ column: (row, idx): JSX.Element => Menu(row, idx, false), header: <b>Actions</b> }]}
            paginationFooter
            exporter={
              <>
                {/*<Box ml={1}>
                  <Button
                    {...buttonProps}
                    onClick={handleAddAnimal}
                    variant='contained'
                    startIcon={<Icon icon='plus' />}>
                    Add
                  </Button>
            </Box>*/}
                <ExportViewer<Critter>
                  template={combinedHeaders as (keyof Critter)[]}
                  eTitle={CritterStrings.exportTitle}
                  data={animalData}
                />
              </>
            }
          />
        </Box>

        {/* Wrapper to allow editing of Attached and Unattached animals */}
        <ModifyCritterWrapper
          editing={editObj}
          onUpdate={(critter_id: string): void => setUpdated(critter_id)}
          onDelete={(critter_id: string): void => setDeleted(critter_id)}
          setCritter={setEditObj}>
          <EditCritter
            editing={editObj}
            onSave={doNothingAsync}
            open={openEdit}
            handleClose={() => setOpenEdit(false)}
          />
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
        <CritterWorkflow
          editing={editObj}
          onUpdate={(critter_id: string) => setUpdated(critter_id)}
          workflow={workflow}
          open={openWorkflow}
          setOpen={setOpenWorkflow}
        />
      </>
    </RowSelectedProvider>
  );
};
