import { useState, useEffect } from 'react';
import DataTable from 'components/table/DataTable';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CollarStrings } from 'constants/strings';
import { ModalBaseProps } from 'components/component_interfaces';
import { Button, Modal } from 'components/common';
import { eCritterPermission, permissionCanModify } from 'types/permission';
import EditDataLifeModal from 'components/form/EditDataLifeModal';
import { useAttachmentChanged } from 'contexts/DeviceAttachmentChangedContext';

export type IAssignmentHistoryPageProps = Pick<ModalBaseProps, 'open' | 'handleClose'> & {
  critter_id: string;
  permission_type: eCritterPermission;
};

/**
 * modal component that contains data table that displays device attachment history
 * controls visibility of @function PerformAssignmentAction component
 * accessed from @function EditCritter main page
 */
export default function AssignmentHistory(props: IAssignmentHistoryPageProps): JSX.Element {
  const { critter_id, open, handleClose, permission_type } = props;
  const api = useTelemetryApi();
  const attachmentChanged = useAttachmentChanged();
  const [currentAttachment, setCurrentAttached] = useState<CollarHistory>(new CollarHistory());
  const [selectedAttachment, setSelectedAttachment] = useState<CollarHistory>(new CollarHistory());
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);
  const [showEditDL, setShowEditDL] = useState(false);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    if (history.length) {
      const attachment = hasCollarCurrentlyAssigned(history);
      // console.log('found current device attachment', attachment);
      setCurrentAttached(attachment);
    }
  }, [history]);

  useEffect(() => {
    // console.log('assignment history page: device was assigned or removed', attachmentChanged);
    handleClose(false);
  }, [attachmentChanged]);

  /**
   * Custom column button component passed to device assignment history data table.
   * When the 'selected' attachment is selected clicking the button,
   * toggle the display of the @function EditDataLifeModal
   */
  const EditDatalifeColumn = (row: CollarHistory): JSX.Element => {
    const handleClick = async (): Promise<void> => {
      await setSelectedAttachment(row);
      setShowEditDL(() => !showEditDL);
    };
    return (
      <Button disabled={!permissionCanModify(permission_type)} onClick={handleClick}>
        Edit
      </Button>
    );
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <DataTable
        title={CollarStrings.assignmentHistoryByAnimalTitle}
        headers={CollarHistory.propsToDisplay}
        queryProps={{ query: api.useCollarAssignmentHistory, param: critter_id, onNewData: onNewData }}
        paginate={history?.length >= 10}
        customColumns={[{ column: EditDatalifeColumn, header: <b>Modify Data Life</b> }]}
      />
      <PerformAssignmentAction current_attachment={currentAttachment} {...props} />
      <EditDataLifeModal
        attachment={selectedAttachment}
        handleClose={(): void => setShowEditDL(false)}
        open={showEditDL}
        permission_type={permission_type}
      />
    </Modal>
  );
}
