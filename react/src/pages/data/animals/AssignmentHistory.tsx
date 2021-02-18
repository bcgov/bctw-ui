import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
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
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  const handleSelect = (): void => {
    // no current interactions with selecting assignment history rows
  };

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d);
  };

  useEffect(() => {
    const updateComponent = (): void => {
      if (history && history.length) {
        setHasCollar(hasCollarCurrentlyAssigned(history));
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
        onSelect={handleSelect}
      />
      <PerformAssignmentAction collarId={history.length ? history[0].collar_id : ''} hasCollar={hasCollar} {...props} />
    </>
  );
}
