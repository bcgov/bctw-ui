import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { CollarHistory, hasCollarCurrentlyAssigned, ICollarHistory } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';
import { useTelemetryApi } from 'hooks/useTelemetryApi';

type IAssignmentHistoryProps = {
  animalId: string;
  canEdit: boolean; // passed to child PerformAssignmentAction component
};

/**
 *  displays a table with collar history and nests
 *  all of the collar assign/unassign handling components
 */
export default function AssignmentHistory(props: IAssignmentHistoryProps): JSX.Element {
  const { animalId } = props;
  const bctwApi = useTelemetryApi();
  const [attachedCollar, setAttachedCollar] = useState<ICollarHistory>();
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    const updateComponent = (): void => {
      if (history && history.length) {
        setAttachedCollar(hasCollarCurrentlyAssigned(history));
      }
    };
    updateComponent();
  }, [history]);

  return (
    <>
      <Table
        title='Collar Assignment History'
        headers={['device_id', 'collar_make', 'valid_from', 'valid_to']}
        queryProps={{ query: bctwApi.useCollarAssignmentHistory, param: animalId, onNewData: onNewData }}
        paginate={history?.length >= 10}
      />
      <PerformAssignmentAction collarId={attachedCollar?.collar_id ?? ''} hasCollar={!!attachedCollar} {...props} />
    </>
  );
}
