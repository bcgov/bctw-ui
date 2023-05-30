import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction, { PerformAssignmentPageProps } from './PerformAssignmentAction';

export const AttachRemoveDevice = (props: PerformAssignmentPageProps): JSX.Element => {
  const api = useTelemetryApi();
  const { data, isSuccess } = api.useCollarAssignmentHistory(0, props.critter_id, { enabled: !!props.critter_id });
  const [currentAttachment, setCurrentAttached] = useState<CollarHistory>(new CollarHistory());
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    if (history.length) {
      const attachment = hasCollarCurrentlyAssigned(history);
      setCurrentAttached(attachment);
    }
  }, [history]);
  useEffect(() => {
    if (isSuccess && data?.length) {
      onNewData(data);
    }
  });
  return <PerformAssignmentAction {...props} current_attachment={currentAttachment} disableBtn={true} />;
};
