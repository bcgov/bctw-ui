import { useState, useEffect } from 'react';
import Table from 'components/table/Table';
import { Typography } from '@material-ui/core';
import { CollarHistory, hasCollarCurrentlyAssigned } from 'types/collar_history';
import PerformAssignmentAction from 'pages/data/animals/PerformAssignmentAction';

type IAssignmentHistoryProps = {
  animalId: number;
  deviceId?: number;
};

/**
 *  displays a table with collar history and nests
 *  all of the collar assign/unassign handling components
 */
export default function AssignmentHistory(props: IAssignmentHistoryProps): JSX.Element {
  const { animalId } = props;
  const [hasCollar, setHasCollar] = useState<boolean>(false);
  const [history, setCollarHistory] = useState<CollarHistory[]>([]);

  // nothing for user to interact with by selecting row, so this is a null handler
  const handleSelect = (): void => { /* do nothing */ };

  const onNewData = (d: CollarHistory[]): void => {
    setCollarHistory(d)
  }

  useEffect(() => {
    const u = (): void => {
      if (history && history.length) {
        setHasCollar(hasCollarCurrentlyAssigned(history));
      }
    };
    u();
  }, [history]);

  // instantiate this component here as we want to display the add collar
  // option if the critter has no collar history
  const assignment = <PerformAssignmentAction deviceId={history?.length ? history[0].device_id : 0} hasCollar={hasCollar} {...props} />;
  return (
    <>
      {history.length ? <Typography variant='h6'>Collar Assignment History</Typography> : null }
      <Table
        headers={['device_id', 'make', 'start_time', 'end_time']}
        queryProps={{ query: 'useCollarHistory', queryParam: animalId, onNewData: onNewData }}
        rowIdentifier='device_id'
        paginate={history?.length >= 10}
        onSelect={handleSelect}
        renderIfNoData={false}
      />
      {assignment}
    </>
  );
}
