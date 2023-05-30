import { Box, MenuItem, Select } from '@mui/material';
import { Button } from 'components/common';
import { ModalBaseProps } from 'components/component_interfaces';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import DataTable from 'components/table/DataTable';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { manageLayoutStyles } from 'pages/layouts/ManageLayout';
import { useContext, useEffect, useState } from 'react';
import { IUserCritterAccessInput, UserCritterAccess } from 'types/animal_access';
import {
  IUserCritterPermissionInput,
  adminPermissionOptions,
  eCritterPermission,
  managerPermissionOptions
} from 'types/permission';
import { User } from 'types/user';

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
  headers = UserCritterAccess.propsToDisplay,
  paginate = true,
  allRecords = false
}: PickCritterProps): JSX.Element {
  const useUser = useContext(UserContext);
  const api = useTelemetryApi();
  const [user, setUser] = useState<User>(userToLoad ?? useUser.user);
  // table row selected state
  const [critterIDs, setCritterIDs] = useState<string[]>([]);

  //const [forceRefresh, setForceRefresh] = useState<boolean>(false);
  //const [triggerReset, setTriggerReset] = useState(0);
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

  // Keeps track of conditionally rendered columns from collection_units
  const [combinedHeaders, setCombinedHeaders] = useState<(keyof UserCritterAccess | string)[]>(
    UserCritterAccess.animalManagerDisplayProps as (keyof UserCritterAccess | string)[]
  );

  const canSave = showSelectPermission && Object.values(access).filter((a) => a.wasSelected);
  const classes = manageLayoutStyles();

  // if a user is not passed in as a prop, default the state to the current user
  useEffect(() => {
    const u = !userToLoad && useUser.user ? useUser.user : userToLoad;
    setUser(u);
    setPermissionsAccessible(useUser?.user?.is_admin ? adminPermissionOptions : managerPermissionOptions);
  }, [userToLoad, useUser]);

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
    handleCollectionColumns(rows);
  };

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: api.useCritterAccess,
    param: { user, filter },
    onNewData
  };

  // Inserts unique collection_unit categories as new column headers
  const handleCollectionColumns = (rows: UserCritterAccess[]): void => {
    const keys = rows.flatMap((row) => row.collectionUnitKeys);
    const uniqueKeys = [...new Set(keys)];
    setCombinedHeaders([
      ...UserCritterAccess.animalManagerDisplayProps.slice(0, 2),
      ...uniqueKeys,
      ...UserCritterAccess.animalManagerDisplayProps.slice(2)
    ]);
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
    //setCritterIDs([]);
    handleClose(false);
  };

  /**
   * adds a select dropdown component as the last table row that
   * allows the user to select a permission type for the animal row
   * fixme: using a hook in this component triggers hook error in datatable
   */
  const NewColumn = (row: UserCritterAccess, idx: number, isSelected: boolean): JSX.Element => {
    const hasAccess = access[row.critter_id];
    // set default in this order
    const defaultPermission = hasAccess?.permission_type ?? row?.permission_type ?? eCritterPermission.observer;
    // show an error if the select isn't filled out but the row is selected
    const isError = !hasAccess ? false : critterIDs.includes(hasAccess.critter_id) && !hasAccess.wasSelected;
    const changeHandler = (e: any, p: eCritterPermission) => {
      e.stopPropagation();
      e.preventDefault();
      const permission = p; //v.target.value as eCritterPermission;
      setAccess((prevState) => {
        const cp = { ...prevState };
        critterIDs.forEach((id) => {
          cp[id].permission_type = permission;
          cp[id].wasSelected = true;
        });
        return cp;
      });
    };
    return (
      <Select
        required={true}
        //error={isError}
        size='small'
        value={defaultPermission}
        disabled={!isSelected}
        sx={{ minWidth: 120 }}
        onClick={(e) => e.stopPropagation()}>
        {/* show select dropdown options based on user role */}
        {permissionsAccessible.sort().map((d) => (
          <MenuItem key={`menuItem-${d}`} value={d} onClick={(e) => changeHandler(e, d)}>
            {d}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /**
   * adds a compact index column to the table
   */
  const IdxColumn = (row: UserCritterAccess, idx: number): JSX.Element => {
    return (
      <Box className={'dimmed-cell'} padding={'none'}>
        {idx + 1}{' '}
      </Box>
    );
  };

  return (
    <FullScreenDialog open={open} handleClose={beforeClose}>
      <Box py={1} px={4} className={classes.manageLayoutContent}>
        <DataTable
          headers={combinedHeaders as (keyof UserCritterAccess)[]}
          title={title}
          queryProps={tableProps}
          onSelectMultiple={handleSelect}
          alreadySelected={alreadySelected}
          customColumns={
            showSelectPermission
              ? [
                  { column: NewColumn, header: <b>Select Permission</b> },
                  { column: IdxColumn, header: <b></b>, prepend: true }
                ]
              : []
          }
          fullScreenHeight={true}
          paginationFooter={true}
          requestDataByPage={false}
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
