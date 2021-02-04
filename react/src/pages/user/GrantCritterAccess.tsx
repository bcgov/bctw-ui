import { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { INotificationMessage } from 'components/component_interfaces';
import { eCritterPermission, User } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { ICritterAccess } from 'api/api_interfaces';
import { Animal } from 'types/animal';

type IGrantCritterModalProps = {
  isGrantingAccess: boolean;
  users: User[];
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (collar_id: string) => void;
};

export default function GrantCritterModal({
  show,
  onClose,
  onSave,
  users,
  isGrantingAccess
}: IGrantCritterModalProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const [critterIds, setCritterIds] = useState<Animal[]>([]);
  const responseDispatch = useResponseDispatch();

  const onSuccess = (): void => {};

  const onError = (error: AxiosError): void => {
    // updateStatus({
    //   type: 'error',
    //   message: `error ${isLink ? 'linking' : 'removing'} collar: ${formatAxiosError(error)}`
    // });
  };

  const updateStatus = (notif: INotificationMessage): void => {
    responseDispatch(notif);
  };

  const { mutateAsync } = (bctwApi.useMutateGrantCritterAccess as any)({ onSuccess, onError });

  const handleSelect = (rows: Animal[]): void => {
    setCritterIds(rows);
  };

  const handleSave = async (): Promise<void> => {
    const access: ICritterAccess[] = critterIds.map((c) => {
      return {
        animal_id: c.id,
        permission_type: eCritterPermission.view
      };
    });
    const data = users.map((i) => {
      return {
        userId: i.id,
        access
      };
    });
    console.log(JSON.stringify(data, null, 2));
    await mutateAsync(data);
  };

  const tableQueryProps: ITableQueryProps<any> = {
    query: isGrantingAccess ? 'useAllCritters' : 'useCritterAccess',
    queryParam: isGrantingAccess ? null : users[0]?.idir
  };

  const createTitle = (): string => {
    const base = 'animal access';
    const start = `${isGrantingAccess ? `Grant ${base} to` : `Remove ${base} from`}`;
    const end = users.map((u) => u.idir).join(', ');
    return `${start} ${end}`;
  };

  const newColumn = () => (
    <Select
      labelId='demo-simple-select-label'
      id='demo-simple-select'
      value={'ad'}
      onChange={(v) => {
        console.log(v);
      }}>
      <MenuItem value={10}>Ten</MenuItem>
      <MenuItem value={20}>Twenty</MenuItem>
      <MenuItem value={30}>Thirty</MenuItem>
    </Select>
  );

  return (
    <>
      <Modal open={show} handleClose={onClose}>
        <Table
          columns={[newColumn()]}
          headers={['animal_id', 'wlh_id', 'nickname', 'population_unit']}
          title={createTitle()}
          queryProps={tableQueryProps}
          onSelectMultiple={handleSelect}
          isMultiSelect={true}
        />
        <Button disabled={!critterIds.length} onClick={handleSave}>
          Grant Animal(s)
        </Button>
      </Modal>
    </>
  );
}
