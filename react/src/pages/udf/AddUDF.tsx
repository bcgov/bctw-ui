import { useContext, useState } from 'react';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { Animal } from 'types/animal';
import { MenuItem, Select } from '@material-ui/core';
import { eUDFType } from 'types/udf';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import Modal from 'components/modal/Modal';

type IAssignNewCollarModal = {
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (collar_id: string) => void;
};

/**
 */
export default function AddUDF({ show, onClose, onSave }: IAssignNewCollarModal): JSX.Element {
  const bctwApi = useTelemetryApi();
  const critters = useState<Animal[]>([]);
  const eType = useState<eUDFType>(eUDFType.critter_group);
  const useUser = useContext(UserContext);

  const tableProps: ITableQueryProps<Animal> = {
    query: bctwApi.useCritterAccess,
    param: { user: useUser.user?.idir ?? '', filterOutNone: true }
  };

  return (
    <Modal open={show} handleClose={onClose}>
      <Table
        headers={['animal_id', 'wlh_id', 'nickname', 'device_id', 'device_make', 'permission_type']}
        title='Animals you have access to:'
        queryProps={tableProps}
      />
      <Select value={eType}>
        {['critter_group'].map((s, idx) => {
          <MenuItem key={idx} value={s}>
            {s}
          </MenuItem>;
        })}
      </Select>
    </Modal>
  );
}
