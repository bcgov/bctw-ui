import Table from 'components/table/DataTable';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useState } from 'react';
import { eCritterPermission, permissionTableBasicHeaders } from 'types/permission';
import { UserCritterAccess } from 'types/user';

type PickCritterProps<T> = ModalBaseProps & {
  alreadySelected: string[];
  onSave: (critterIDs: string[]) => void;
  filter: eCritterPermission[]
};

/**
 * the critter selection modal that appears when the user 
 * clicks the edit icon from the table.
 * it displays a selectable list of critters the user has @param filter access to
*/
export default function PickCritterPermissionModal<T>({ open, handleClose, onSave, filter, title, alreadySelected }: PickCritterProps<T>): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();
  const [critterIDs, setCritterIDs] = useState<string[]>([]);
  const [canSave, setCanSave] = useState<boolean>(false);

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user: useUser.user, filter }
  };

  /**
   * note: when @param alreadySelected is provided (aka user has a previously selected critter)
   * the table handler will pass the critter_ids as a @type {string[]} directly
   * rather than as @type {UserCrittterAccess[]}
  */
  const handleSelect = (selected: UserCritterAccess[] | string[]): void => {
    setCanSave(true);
    if (typeof selected[0] === 'string') {
      setCritterIDs(selected as string[])
    } else {
      const ids = (selected as UserCritterAccess[]).map((v) => v[v.identifier])
      setCritterIDs(ids);
    }
  };

  const handleSave = (): void => {
    onSave(critterIDs);
    beforeClose();
  };

  const beforeClose = (): void => {
    setCanSave(false);
    handleClose(false);
  };

  return (
    <Modal open={open} handleClose={beforeClose}>
      <Table
        headers={permissionTableBasicHeaders}
        title={title}
        queryProps={tableProps}
        onSelectMultiple={handleSelect}
        isMultiSelect={true}
        alreadySelected={alreadySelected}
      />
      <div className={'admin-btn-row'}>
        <Button disabled={!canSave} onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
}