import { useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { eCritterPermission, User } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import {
  IBulkUploadResults,
  ICritterAccess,
  IGrantCritterAccessResults,
  IUserCritterPermissionInput
} from 'api/api_interfaces';
import { Animal } from 'types/animal';
import { formatAxiosError } from 'utils/common';
import { MenuItem, Select } from '@material-ui/core';

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
  const [accessTypes, setAccessTypes] = useState<Record<string, 'view' | 'change'>[]>([]);
  const responseDispatch = useResponseDispatch();

  const onSuccess = (ret: IBulkUploadResults<IGrantCritterAccessResults>): void => {
    const { errors, results } = ret;
    if (ret.errors.length) {
      responseDispatch({ type: 'error', message: `${errors.join()}` });
    } else {
      responseDispatch({
        type: 'success',
        message: `animal access granted for users: ${users.map((u) => u.idir).join(', ')}`
      });
    }
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  const { mutateAsync } = (bctwApi.useMutateGrantCritterAccess as any)({ onSuccess, onError });

  const handleSelect = (critters: Animal[]): void => {
    setCritterIds(critters);
  };

  const handleSave = async (): Promise<void> => {
    const access: ICritterAccess[] = critterIds.map((c) => {
      return {
        animal_id: c.id,
        permission_type: eCritterPermission.view
      };
    });
    const data: IUserCritterPermissionInput[] = users.map((i) => {
      return {
        userId: i.id,
        access
      };
    });
    // console.log(JSON.stringify(data, null, 2));
    await mutateAsync(data);
    onClose(false);
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

  const newColumn = (row: any, idx: number): JSX.Element =>{
    const v = accessTypes[row.id] ?? 'view';
    return (
      <Select
        value={v}
        onChange={(v) => {
          console.log(row, idx);
          const permission = v.target.value;
          // console.log(permission);
          setAccessTypes(prevState => {
            const rowid: string = row.id;
            const r = Object.assign({}, prevState);
            r[rowid] = permission;
            return r;
          });
        }}>
        <MenuItem value={eCritterPermission.view}>View</MenuItem>
        <MenuItem value={eCritterPermission.change}>Change</MenuItem>
      </Select>
    )
  }

  return (
    <>
      <Modal open={show} handleClose={onClose}>
        <Table
          // columns={[newColumn]}
          headers={['animal_id', 'wlh_id', 'nickname', 'device_id', 'collar_make', 'population_unit']}
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
