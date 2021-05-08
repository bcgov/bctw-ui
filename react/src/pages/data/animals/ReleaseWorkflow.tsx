import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { WorkflowStrings } from 'constants/strings';

type IMortalityWorkflowProps = {
  animalId: string;
  canEdit: boolean; // passed to child PerformAssignmentAction component
};

/**
 *  displays a table with collar history and nests
 *  all of the collar assign/unassign handling components
 */
export default function MortalityWorkflow(props: IMortalityWorkflowProps): JSX.Element {
  const { animalId } = props;
  const bctwApi = useTelemetryApi();
  const [isDeviceAttached, setIsDeviceAttached] = useState<string>(null);
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    if (history?.length) {
      const attachment = hasCollarCurrentlyAssigned(history);
      setIsDeviceAttached(attachment?.collar_id);
    }
  }, [history]);

  return (
    <>
      <h3>{WorkflowStrings.releaseWorkflowTitle}</h3>
    </>
  );
}
