import DataTable from 'components/table/DataTable';
import { Modal } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useEffect, useState } from 'react';
import { adminPermissionOptions, eCritterPermission, IUserCritterPermissionInput, ownerPermissionOptions } from 'types/permission';
import { IUserCritterAccessInput, PermissionTableHeaders, User, UserCritterAccess } from 'types/user';
import { Select, MenuItem } from '@material-ui/core';
import useDidMountEffect from 'hooks/useDidMountEffect';

type PickCritterProps = ModalBaseProps & {
  alreadySelected: string[];
  onSave: (critterIDs: string[] | IUserCritterPermissionInput) => void;
  filter: eCritterPermission[];
  showSelectPermission?: boolean;
  userToLoad?: User;
  headersToShow?: string[];
};

/**
 * this type is only used in this component to differentiate between the user's own 
 * permission_type and the one they selected if @param showSelectPermission is true
 */
type SelectedUserCritterAccessInput = IUserCritterAccessInput & {
  wasSelected: boolean;
}

/**
 * the critter selection modal that appears when the user
 * clicks the edit icon from the table.
 * it displays a selectable list of critters the user has @param filter access to
 * @param alreadySelected a list of critter_ids previously selected 
 * @param filter fetch only @type {eCritterPermission}
 * @param showSelectPermission if true, adds a select dropdown component containing the different @type {eCritterPermission} options
 * @param userToLoad unless specified, loads permissions for the current user
 * @param headersToShow headers to display in the permission table modal
*/
export default function PickCritterPermissionModal({
  open,
  handleClose,
  onSave,
  filter,
  title,
  alreadySelected,
  showSelectPermission,
  userToLoad,
  headersToShow = PermissionTableHeaders
}: PickCritterProps): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();
  const [user, setUser] = useState<User>(userToLoad ?? useUser.user);
  // table row selected state
  const [critterIDs, setCritterIDs] = useState<string[]>([]);
  const [canSave, setCanSave] = useState<boolean>(false);
  /**
   * state for each of the column select components rendered in the table
   * only used when @param showSelectPermission is true
   */ 
  const [accessTypes, setAccessTypes] = useState<SelectedUserCritterAccessInput[]>([]);
  /**
   * the options to show in the select dropdown when @param showSelectPermission is true.
   * depends on the user role - admin vs owner
   */
  const [permissionsAccessible, setPermissionsAccessible] = useState<eCritterPermission[]>([]);

  // if a user is not passed in as a prop, default the state to the current user
  useEffect(() => {
    const u = !userToLoad && useUser.ready ? useUser.user : userToLoad;
    setUser(u);
    setPermissionsAccessible(useUser?.user?.is_admin ? adminPermissionOptions : ownerPermissionOptions);
  }, [userToLoad, useUser.ready]);

  // when the selected state changes, update the save button's disabled state
  useDidMountEffect(() => {
    if (showSelectPermission) {
      // if the select dropdown is shown, user must have an option selected for the corresponding row to be able to save
      const selectedRows = accessTypes.filter(a => critterIDs.includes(a.critter_id) && a.wasSelected);
      if (critterIDs.length !== selectedRows.length) {
        setCanSave(false);
        return;
      }
    } 
    // at least one row has to be selected
    setCanSave(!!critterIDs.length);
  }, [critterIDs])

  // when the table query finishes - update the accesTypes state
  const handleDataLoaded = (rows: UserCritterAccess[]): void => {
    setAccessTypes((o) => {
      // preserve permission selections across pages.
      const copy = [...o];
      rows.forEach((item) => {
        const idx = copy.findIndex((c) => c.critter_id === item.critter_id);
        if (idx === -1) {
          // add the wasSelected prop
          copy.push(Object.assign({wasSelected: false}, item));
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
   * when @param alreadySelected is provided (user has a previously selected critter saved)
   * the table handler will pass the critter_ids as a @type {string[]} directly rather than as @type {UserCrittterAccess[]}
  */
  const handleSelect = (selected: UserCritterAccess[] | string[]): void => {
    const ids = typeof selected[0] === 'string' ? selected as string[] : (selected as UserCritterAccess[]).map((v) => v[v.identifier]);
    setCritterIDs(ids);
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
    });
    const toSave: IUserCritterPermissionInput = {
      userId: user.id,
      access
    };
    onSave(toSave);
  };

  const beforeClose = (): void => {
    setCanSave(false);
    handleClose(false);
  };

  /** 
   * adds a select dropdown component as the last table row that
   * allows the user to select a permission type for the animal row
  */
  const newColumn = (row: UserCritterAccess): JSX.Element => {
    const access = accessTypes.find((cp) => cp.critter_id === row.critter_id);
    // set default in this order
    const defaultPermission = access?.permission_type ?? row?.permission_type ?? eCritterPermission.observer;
    // show an error if the select isn't filled out but the row is selected
    const isError = !access ? false : (critterIDs.includes(access.critter_id) && !access.wasSelected);
    return (
      <Select
        required={true}
        error={isError}
        style={{width: '90px'}} // fits the longest critter permission type
        value={defaultPermission}
        onChange={(v: React.ChangeEvent<{ value: unknown }>): void => {
          // dont propagate the event to the row selected handler
          v.stopPropagation();
          const permission = v.target.value as eCritterPermission;
          setAccessTypes((prevState) => {
            const idx = prevState.findIndex((c) => c.critter_id === row.critter_id);
            const cp = Object.assign([], prevState);
            cp[idx].permission_type = permission;
            cp[idx].wasSelected = true;
            return cp;
          });
        }}>
        {/* show select dropdown options based on user role */}
        {permissionsAccessible
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
        headers={headersToShow}
        title={title}
        queryProps={tableProps}
        onSelectMultiple={handleSelect}
        isMultiSelect={true}
        alreadySelected={alreadySelected}
        customColumns={showSelectPermission ? [{ column: newColumn, header: (): JSX.Element => <b>Select Permission</b> }] : null}
      />
      <div className={'admin-btn-row'}>
        <Button disabled={!canSave} onClick={handleSave}>Save</Button>
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
