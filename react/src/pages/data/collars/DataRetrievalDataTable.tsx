import Icon from 'components/common/Icon';
import { ActionsMenu } from 'components/common/partials/ActionsMenu';
import DataTable from 'components/table/DataTable';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState } from 'react';
import { AttachedCollar } from 'types/collar';

export const DataRetrievalDataTable = (): JSX.Element => {
  const api = useTelemetryApi();
  const [editObj, setEditObj] = useState<AttachedCollar>({} as AttachedCollar);
  const handleSelect = <T extends AttachedCollar>(row: T): void => setEditObj(row);

  const Menu = (row: AttachedCollar, idx: number): JSX.Element => {
    const _edit = (): void => {
      console.log('');
    };
    const defaultItems = [
      {
        label: 'Edit',
        icon: <Icon icon={'edit'} />,
        handleClick: _edit
      },
      {
        label: 'Update Telemetry',
        icon: <Icon icon={'refresh'} />,
        handleClick: _edit
      }
    ];
    return <ActionsMenu disabled={row !== editObj} menuItems={defaultItems} />;
  };

  return (
    <DataTable
      headers={AttachedCollar.dataRetrievalPropsToDisplay}
      title={'Data Retrieval'}
      queryProps={{ query: api.useAssignedCritters }}
      customColumns={[{ column: Menu, header: <b>Actions</b> }]}
      onSelect={handleSelect}
    />
  );
};
