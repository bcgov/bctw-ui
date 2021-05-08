import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CollarStrings } from 'constants/strings';

type IAssignmentHistoryProps = {
  animalId: string;
  deviceId: string;
  canEdit: boolean; // passed to child PerformAssignmentAction component
  assignAnimalToDevice?: boolean;
};

/**
 *  displays a table with collar history and nests
 *  all of the collar assign/unassign handling components
 */
export default function AssignmentHistory(props: IAssignmentHistoryProps): JSX.Element {
  const { animalId, deviceId, assignAnimalToDevice } = props;
  const bctwApi = useTelemetryApi();
  const [isDeviceAttached, setIsDeviceAttached] = useState<string>(null);
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  if (assignAnimalToDevice) {
/*
    useEffect(() => {
      if (history?.length) {
        const attachment = hasCollarCurrentlyAssigned(history);
        setIsDeviceAttached(attachment?.collar_id);
      }
    }, [history]);
*/
    return (
      <>
        <Table
          title={CollarStrings.assignmentHistoryByDeviceTitle}
          headers={['device_id', 'device_make', 'valid_from', 'valid_to']}
          queryProps={{ query: bctwApi.useCollarAssignmentHistory, param: deviceId, onNewData: onNewData }}
          paginate={history?.length >= 10}
        />
      </>
    );
  } else {
    useEffect(() => {
      if (history?.length) {
        const attachment = hasCollarCurrentlyAssigned(history);
        setIsDeviceAttached(attachment?.collar_id);
      }
    }, [history]);
    return (
      <>
        <Table
          title={CollarStrings.assignmentHistoryByAnimalTitle}
          headers={['device_id', 'device_make', 'valid_from', 'valid_to']}
          queryProps={{ query: bctwApi.useCollarAssignmentHistory, param: animalId, onNewData: onNewData }}
          paginate={history?.length >= 10}
        />
        <PerformAssignmentAction collarId={isDeviceAttached} {...props} />
      </>
    );
  }

}
