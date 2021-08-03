import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import { useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { WorkflowStrings } from 'constants/strings';

type IRetrievalWorkflowProps = {
  open;
  handleClose;
  handleSave; 
  device_id: number;
};

/**
 * fixme: todo: very incomplete
*/
export default function RetrievalEventForm(props: IRetrievalWorkflowProps): JSX.Element {
  const { device_id } = props;
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
      <h3>{WorkflowStrings.retrievalWorkflowTitle}</h3>
    </>
  );
}