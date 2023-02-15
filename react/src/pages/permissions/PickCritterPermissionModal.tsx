import DataTable from 'components/table/DataTable';
import { Button, Modal } from 'components/common';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { ModalBaseProps } from 'components/component_interfaces';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useContext, useEffect, useState } from 'react';
import {
  adminPermissionOptions,
  eCritterPermission,
  IUserCritterPermissionInput,
  managerPermissionOptions
} from 'types/permission';
import { User } from 'types/user';
import { Select, MenuItem, SelectChangeEvent, Box } from '@mui/material';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { IUserCritterAccessInput, UserCritterAccess } from 'types/animal_access';
import { manageLayoutStyles } from 'pages/layouts/ManageLayout';

type PickCritterProps = ModalBaseProps & {
  alreadySelected: string[];
  onSave: (critterIDs: string[] | IUserCritterPermissionInput) => void;
  filter: eCritterPermission[];
  showSelectPermission?: boolean;
  userToLoad?: User;
  headersToShow?: string[];
  headers?: (keyof UserCritterAccess)[];
  paginate?: boolean;
  allRecords?: boolean;
};

/**
 * used in this component to differentiate between the user's own
 * permission_type and the one they selected if @param showSelectPermission is true
 */
type SelectedUserCritterAccessInput = IUserCritterAccessInput & { wasSelected: boolean };

/**
 * the critter selection modal that appears when the user
 * clicks the edit icon from the table.
 * it displays a selectable list of critters the user has @param filter access to
 * @param alreadySelected a list of critter_ids previously selected
 * @param filter fetch only @type {eCritterPermission}
 * @param showSelectPermission if true, adds a select dropdown component containing the different @type {eCritterPermission} options
 * @param userToLoad unless specified, loads permissions for the current user
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
  headers=UserCritterAccess.propsToDisplay,
  paginate=true,
  allRecords=false
}: PickCritterProps): JSX.Element {
  const useUser = useContext(UserContext);
  const api = useTelemetryApi();
  const [user, setUser] = useState<User>(userToLoad ?? useUser.user);
  // table row selected state
  const [critterIDs, setCritterIDs] = useState<string[]>([]);
  const [canSave, setCanSave] = useState(false);

  const [triggerReset, setTriggerReset] = useState(0);
  /**
   * state for each of the column select components rendered in the table
   * only used when @param showSelectPermission is true
   */
  const [access, setAccess] = useState<Record<string, SelectedUserCritterAccessInput>>({});
  /**
   * the options to show in the select dropdown when @param showSelectPermission is true.
   * depends on the user role - admin vs critter manager
   */
  const [permissionsAccessible, setPermissionsAccessible] = useState<eCritterPermission[]>([]);

  const classes = manageLayoutStyles();

  // if a user is not passed in as a prop, default the state to the current user
  useEffect(() => {
    const u = !userToLoad && useUser.user ? useUser.user : userToLoad;
    setUser(u);
    setPermissionsAccessible(useUser?.user?.is_admin ? adminPermissionOptions : managerPermissionOptions);
  }, [userToLoad, useUser]);

  // when the selected state changes, update the save button's disabled state
  useDidMountEffect(() => {
    if (showSelectPermission) {
      // if the select dropdown is shown, user must have an option selected for the corresponding row to be able to save
      // const selectedRows = Object.values(access).filter((a) => critterIDs.includes(a.critter_id) && a.wasSelected);
      // if (critterIDs.length !== selectedRows.length) {
      //   setCanSave(false);
      //   return;
      // }
      const onlySelected = Object.values(access).filter((a) => a.wasSelected);
      setCanSave(!!onlySelected.length);
    }

    // at least one row has to be selected
    // setCanSave(!!critterIDs.length);
  }, [critterIDs, access]);

  // when the table query finishes - update the access state
  const onNewData = (rows: UserCritterAccess[]): void => {
    setAccess((o) => {
      // preserve permission selections across pages.
      const copy = { ...o };
      rows.forEach((item) => {
        const match: SelectedUserCritterAccessInput = copy[item.critter_id];
        if (match) {
          match.wasSelected = false;
        } else {
          const { wlh_id, animal_id, critter_id, permission_type } = item;
          copy[item.critter_id] = { animal_id, critter_id, permission_type, wasSelected: false, wlh_id };
        }
      });
      return copy;
    });
  };

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: api.useCritterAccess,
    param: { user, filter },
    onNewData
  };

  /**
   * when @param alreadySelected is provided (user has a previously selected critter saved)
   * the table handler will pass the critter_ids as a @type {string[]} directly rather than as @type {UserCrittterAccess[]}
   */
  const handleSelect = (selected: UserCritterAccess[] | string[]): void => {
    const ids =
      typeof selected[0] === 'string'
        ? (selected as string[])
        : (selected as UserCritterAccess[]).map((v) => v[v.identifier]);
    setCritterIDs(ids);
  };

  const handleSave = (): void => {
    if (!showSelectPermission) {
      onSave(critterIDs);
      beforeClose();
      return;
    }
    // get the permission type state for each selected
    const hasaccess: IUserCritterAccessInput[] = critterIDs.map((c) => {
      const critter = access[c];
      if (!critter || !critter.wasSelected) {
        return;
      }
      return critter;
    });
    const toSave: IUserCritterPermissionInput = {
      userId: user.id,
      access: hasaccess
    };
    onSave(toSave);
    beforeClose();
  };

  const beforeClose = (): void => {
    setCritterIDs([]);
    setCanSave(false);
    handleClose(false);
  };

  /**
   * adds a select dropdown component as the last table row that
   * allows the user to select a permission type for the animal row
   * fixme: using a hook in this component triggers hook error in datatable
   */
  const NewColumn = (row: UserCritterAccess): JSX.Element => {
    const hasAccess = access[row.critter_id];
    // set default in this order
    const defaultPermission = hasAccess?.permission_type ?? row?.permission_type ?? eCritterPermission.observer;
    // show an error if the select isn't filled out but the row is selected
    const isError = !hasAccess ? false : critterIDs.includes(hasAccess.critter_id) && !hasAccess.wasSelected;

    return (
      <Select
        required={true}
        error={isError}
        size='small'
        value={defaultPermission}
        disabled={!critterIDs.includes(row.critter_id)}
        sx={{ minWidth: 120 }}
        // dont propagate the event to the row selected handler
        onClick={(event): void => event.stopPropagation()}
        onChange={(v: SelectChangeEvent<eCritterPermission>): void => {
          const permission = v.target.value as eCritterPermission;
          setAccess((prevState) => {
            const cp = { ...prevState };
            critterIDs.forEach((id) => {
              cp[id].permission_type = permission;
              cp[id].wasSelected = true;
            });
            return cp;
          });
          setTriggerReset((prev) => prev + 1);
        }}>
        {/* show select dropdown options based on user role */}
        {permissionsAccessible.sort().map((d) => (
          <MenuItem key={`menuItem-${d}`} value={d}>
            {d}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <FullScreenDialog open={open} handleClose={beforeClose}>
      <Box py={1} px={4} className={classes.manageLayoutContent}>
        <DataTable
          headers={headers}
          title={title}
          queryProps={tableProps}
          onSelectMultiple={handleSelect}
          resetSelections={triggerReset}
          isMultiSelect={true}
          alreadySelected={alreadySelected}
          customColumns={showSelectPermission ? [{ column: NewColumn, header: <b>Select Permission</b> }] : []}
          paginate={paginate}
          allRecords={allRecords}
          fullScreenHeight={true}
        />
        <div className={'admin-btn-row'}>
          <Button disabled={!canSave} onClick={handleSave}>
            Save
          </Button>
        </div>
      </Box>
    </FullScreenDialog>
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
