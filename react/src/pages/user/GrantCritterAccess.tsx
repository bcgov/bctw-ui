import { useEffect, useState } from 'react';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import Table from 'components/table/Table';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { eCritterPermission,  IUserCritterAccessInput, User, UserCritterAccess } from 'types/user';
import { ITableQueryProps } from 'components/table/table_interfaces';
import {
  IBulkUploadResults,
  IGrantCritterAccessResults,
  IUserCritterPermissionInput
} from 'api/api_interfaces';
import { formatAxiosError } from 'utils/common';
import { MenuItem, Select } from '@material-ui/core';

type IGrantCritterModalProps = {
  users: User;
  show: boolean;
  onClose: (close: boolean) => void;
  onSave: (collar_id: string) => void;
};

/**
 * modal that shows a list of critters that can be individually or multi selected.
 * passes a custom select header/column component to the Table
*/
export default function GrantCritterModal({ show, onClose, onSave, users }: IGrantCritterModalProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  // which critters are selected in the table
  const [critters, setCritters] = useState<UserCritterAccess[]>([]);
  // state for each of the column select components rendered in the table
  const [accessTypes, setAccessTypes] = useState<IUserCritterAccessInput[]>([]);
  // state for the custom header select dropdown
  const [tableHeaderCritterSelectOption, setTableHeaderCritterSelectOption] = useState<eCritterPermission>(
    eCritterPermission.view
  );

  // show notification on successful user/critter grant api call
  const onSuccess = (ret: IBulkUploadResults<IGrantCritterAccessResults>): void => {
    const { errors, results } = ret;
    if (ret.errors.length) {
      responseDispatch({ type: 'error', message: `${errors.join()}` });
    } else {
      responseDispatch({
        type: 'success',
        message: `animal access granted for users: ${users.idir}`
      });
    }
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });
  const { mutateAsync } = (bctwApi.useMutateGrantCritterAccess as any)({ onSuccess, onError });

  // when the custom table header select is changed, 
  // update all of the custom column selects
  useEffect(() => {
    const updateRows = (): void => {
      setAccessTypes((prevState) => {
        return prevState.map(c => {
          return { id: c.id, permission_type: tableHeaderCritterSelectOption as eCritterPermission }
        })
      });
    };
    updateRows();
  }, [tableHeaderCritterSelectOption]);

  const handleTableRowSelect = (critters: UserCritterAccess[]): void => {
    setCritters(critters);
  };

  const handleSave = async (): Promise<void> => {
    // get the permission type state for each selected
    const access: IUserCritterAccessInput[] = critters.map(c =>{
      const permission_type = accessTypes.find((a) => a.id === c.id).permission_type;
      return { id: c.id, permission_type };
    })
    const data: IUserCritterPermissionInput[] = [users].map((i) => {
      return {
        userId: i.id,
        access
      };
    });
    console.log(JSON.stringify(data, null, 2));
    // await mutateAsync(data);
    handleClose();
  };

  const handleClose = (): void => {
    setAccessTypes([]);
    onClose(false);
  };

  // callback for when the table query finishes
  // update the accesTypes state
  const handleDataLoaded = (rows: UserCritterAccess[]): void => {
    const m = rows.map((r) => ({ id: r.id, permission_type: r.permission_type as eCritterPermission}));
    setAccessTypes(o => {
      // preserve permission selections across pages. 
      const copy = [...o];
      m.forEach(item => {
        const idx = copy.findIndex(c => c.id === item.id);
        if (idx === -1) {
          copy.push(item);
          return
        }
        copy[idx].permission_type = item.permission_type;
      })
      return copy;
    });
  };

  const tableQueryProps: ITableQueryProps<any> = {
    query: 'useCritterAccess',
    queryParam: users?.idir,
    onNewData: handleDataLoaded
  };

  // a custom table body component rendered for each data row
  const newColumn = (row: UserCritterAccess, idx: number): JSX.Element => {
    const perm = accessTypes.find(cp => cp.id === row.id)?.permission_type  ?? row?.permission_type ?? eCritterPermission.view;
    return (
      <Select
        value={perm}
        onChange={(v: React.ChangeEvent<{ value: unknown }>): void => {
          const permission = v.target.value as eCritterPermission;
          setAccessTypes((prevState) => {
            const idx = prevState.findIndex(c => c.id === row.id);
            const cp = Object.assign([], prevState);
            cp[idx].permission_type = permission;
            return cp;
          });
        }}>
        {Object.values(eCritterPermission).map((d) => (
          <MenuItem key={`menuItem-${d}`} value={d}>
            {d}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // a custom table header component. selecting an option from the dropdown
  // updates all of the newColumn selects above.
  const newHeader = (): JSX.Element => {
    return (
      <Select
        value={tableHeaderCritterSelectOption}
        onChange={(e: React.ChangeEvent<{ value: unknown }>): void => {
          setTableHeaderCritterSelectOption(e.target.value as eCritterPermission);
        }}>
        {Object.values(eCritterPermission).map((d) => (
          <MenuItem key={`headermenuItem-${d}`} value={d}>
            {d}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <>
      <Modal open={show} handleClose={handleClose}>
        <Table
          customColumns={[{ column: newColumn, header: newHeader }]}
          headers={['nickname', 'animal_id', 'wlh_id', 'device_id', 'collar_make', 'population_unit']}
          title={`Modifying ${users?.idir ?? 'user'}'s Animal Access`}
          queryProps={tableQueryProps}
          onSelectMultiple={handleTableRowSelect}
          isMultiSelect={true}
        />
        <Button disabled={!critters.length} onClick={handleSave}>
          Save
        </Button>
      </Modal>
    </>
  );
}
