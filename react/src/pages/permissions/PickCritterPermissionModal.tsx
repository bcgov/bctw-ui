import DataTable from 'components/table/DataTable';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useState } from 'react';
import { eCritterPermission, permissionTableBasicHeaders } from 'types/permission';
import { IUserCritterAccessInput, User, UserCritterAccess } from 'types/user';
import { Select, MenuItem } from '@material-ui/core';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { IUserCritterPermissionInput } from 'api/api_interfaces';

type PickCritterProps = ModalBaseProps & {
  alreadySelected: string[];
  onSave: (critterIDs: string[] | IUserCritterPermissionInput) => void;
  filter: eCritterPermission[];
  showSelectPermission?: boolean;
  userToLoad?: User;
};

/**
 * the critter selection modal that appears when the user
 * clicks the edit icon from the table.
 * it displays a selectable list of critters the user has @param filter access to
 * if @param showSelectPermission is true, adds a select dropdown component
 * containing the different @type {eCritterPermission} options
 */
export default function PickCritterPermissionModal({
  open,
  handleClose,
  onSave,
  filter,
  title,
  alreadySelected,
  showSelectPermission,
  userToLoad
}: PickCritterProps): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();
  const [user, setUser] = useState<User>(userToLoad ?? useUser.user);
  const [critterIDs, setCritterIDs] = useState<string[]>([]);
  const [canSave, setCanSave] = useState<boolean>(false);
  // state for each of the column select components rendered in the table
  const [accessTypes, setAccessTypes] = useState<IUserCritterAccessInput[]>([]);

  useDidMountEffect(() => {
    if (!userToLoad && useUser.ready) {
      console.log(useUser.user);
      setUser(useUser.user);
    } else {
      setUser(userToLoad);
    }
  }, [userToLoad, useUser.ready]);

  // when the table query finishes - update the accesTypes state
  const handleDataLoaded = (rows: UserCritterAccess[]): void => {
    // const m = rows.map((r) => ({ critter_id: r.critter_id, permission_type: r.permission_type as eCritterPermission }));
    setAccessTypes((o) => {
      // preserve permission selections across pages.
      const copy = [...o];
      rows.forEach((item) => {
        const idx = copy.findIndex((c) => c.critter_id === item.critter_id);
        if (idx === -1) {
          copy.push(item);
          return;
        }
        copy[idx].permission_type = item.permission_type;
      });
      return copy;
    });
  };

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user, filter },
    onNewData: handleDataLoaded
  };

  /**
   * note: when @param alreadySelected is provided (aka user has a previously selected critter)
   * the table handler will pass the critter_ids as a @type {string[]} directly
   * rather than as @type {UserCrittterAccess[]}
   */
  const handleSelect = (selected: UserCritterAccess[] | string[]): void => {
    setCanSave(true);
    if (typeof selected[0] === 'string') {
      setCritterIDs(selected as string[]);
    } else {
      const ids = (selected as UserCritterAccess[]).map((v) => v[v.identifier]);
      setCritterIDs(ids);
    }
  };

  const handleSave = (): void => {
    if (!showSelectPermission) {
      onSave(critterIDs);
      beforeClose();
      return;
    }
    // get the permission type state for each selected
    const access: IUserCritterAccessInput[] = critterIDs.map((c) => {
      const critter = accessTypes.find((a) => a.critter_id === c);
      if (!critter) {
        //todo: show error?
        console.error('cannot find critter from the loaded user/animal permission!')
        return;
      }
      const { critter_id, permission_type, wlh_id, animal_id } = critter;
      return { critter_id, permission_type, wlh_id, animal_id };
      // return { critter_id: critter?.critter_id, permission_type: critter?.permission_type };
    });
    const toSave: IUserCritterPermissionInput = {
      userId: user.id,
      access
    };
    onSave(toSave);
  };

  const beforeClose = (): void => {
    setCanSave(false);
    setAccessTypes([]);
    handleClose(false);
  };

  /** * adds a select dropdown component at the left side of each table row that
   * allows the user to select a permission type for the animal row
   */
  // todo: fix select width
  const newColumn = (row: UserCritterAccess): JSX.Element => {
    const defaultPermission =
      accessTypes.find((cp) => cp.critter_id === row.critter_id)?.permission_type ??
      row?.permission_type ??
      eCritterPermission.view;
    return (
      <Select
        value={defaultPermission}
        onChange={(v: React.ChangeEvent<{ value: unknown }>): void => {
          // dont propagate the event to the row selected handler
          v.stopPropagation();
          const permission = v.target.value as eCritterPermission;
          setAccessTypes((prevState) => {
            const idx = prevState.findIndex((c) => c.critter_id === row.critter_id);
            const cp = Object.assign([], prevState);
            cp[idx].permission_type = permission;
            return cp;
          });
        }}>
        {Object.values(eCritterPermission)
          .sort()
          .map((d) => (
            <MenuItem key={`menuItem-${d}`} value={d}>
              {d}
            </MenuItem>
          ))}
      </Select>
    );
  };

  return (
    <Modal open={open} handleClose={beforeClose}>
      <DataTable
        headers={permissionTableBasicHeaders}
        title={title}
        queryProps={tableProps}
        onSelectMultiple={handleSelect}
        isMultiSelect={true}
        alreadySelected={alreadySelected}
        customColumns={showSelectPermission ? [{ column: newColumn, header: (): JSX.Element => <></> }] : null}
      />
      <div className={'admin-btn-row'}>
        <Button disabled={!canSave} onClick={handleSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}

// when the custom table header "select all" is changed,
// update all of the custom column selects
/*
  useEffect(() => {
    const updateRows = (): void => {
      setAccessTypes((prevState) => {
        return prevState.map((c) => {
          return { critter_id: c.critter_id, permission_type: tableHeaderCritterSelectOption as eCritterPermission };
        });
      });
    };
    updateRows();
  }, [tableHeaderCritterSelectOption]);
*/

// a custom table header component. selecting an option from the dropdown
// updates all of the newColumn selects above.
// note: disable this as of new privileges workflow
/*
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
}
*/
