import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import { useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { WorkflowStrings } from 'constants/strings';

type IReleaseWorkflowProps = {
  open;
  handleClose;
  handleSave; 
  animal_id: string;
};

/**
 * fixme: todo: very incomplete
*/
export default function ReleaseEventForm(props: IReleaseWorkflowProps): JSX.Element {
  const { animal_id } = props;
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
