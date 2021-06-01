import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import {
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { eUDFType, IUDF } from 'types/udf';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import Modal from 'components/modal/Modal';
import TextField from 'components/form/TextInput';
import { UserCritterAccess } from 'types/user';
import { Icon } from 'components/common';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { ModalBaseProps } from 'components/component_interfaces';
import { useQueryClient } from 'react-query';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

export default function AddUDF({ open, handleClose }: ModalBaseProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const responseDispatch = useResponseDispatch();
  const [critters, setCritters] = useState<UserCritterAccess[]>([]);
  const useUser = useContext(UserContext);
  const [udfs, setUdfs] = useState<IUDF[]>([]);
  const [showCritterSelection, setShowCritterSelection] = useState<boolean>(false);
  const [currentUdf, setCurrentUdf] = useState<IUDF>(null);
  const [canSave, setCanSave] = useState<boolean>(false);

  const { data: udfResults, status: udfStatus } = bctwApi.useUDF(eUDFType.critter_group);

  const { data: critterResults, status: critterStatus } = bctwApi.useCritterAccess(
    0, // page 0 is used to load all values
    { user: useUser.user, filterOutNone: true },
    // useUser.ready // pass user ready status as 'enabled', to wait until user info is loaded
  );

  // when the udfs are fetched
  useEffect(() => {
    if (udfStatus === 'success') {
      setUdfs(udfResults);
      if (!udfResults.length) {
        addRow();
      }
    }
  }, [udfStatus]);

  // when critters are fetched
  useEffect(() => {
    if (critterStatus === 'success') {
      setCritters(critterResults);
    }
  }, [critterStatus]);

  const onSuccess = (): void => {
    responseDispatch({ type: 'success', message: 'user defined groups saved!' });
    queryClient.invalidateQueries('getUDF');
  };

  const onError = (e): void => {
    responseDispatch({ type: 'error', message: `failed to save user defined group: ${e}` });
  };

  // setup the save mutation
  const { mutateAsync, isLoading } = bctwApi.useMutateUDF({ onSuccess, onError });

  const addRow = (): void => {
    const curUdfs = [...udfs];
    curUdfs.push({ udf_id: 0, user_id: 0, type: eUDFType.critter_group, key: '', value: [], changed: false });
    setUdfs(curUdfs);
  };

  const deleteRow = (u: IUDF): void => {
    setUdfs(udfs.filter((udf) => udf.key !== u.key));
    setCanSave(true);
  };

  const duplicateRow = (u: IUDF): void => {
    const dup = Object.assign({}, u);
    dup.key = '';
    setUdfs([...udfs, dup]);
  };

  // when user changes the group name textfield
  const handleChangeName = (v: Record<string, string | number | boolean>, udf: IUDF): void => {
    const newKey = v['group'] as string;
    if (!newKey) {
      return;
    }
    const idx = udfs.findIndex((u) => u.key === udf.key);
    const cp = [...udfs];
    cp[idx].key = newKey;
    cp[idx].changed = true;
    setUdfs(cp);
    setCanSave(true);
  };

  // when the user clicks the edit button for a udf in the table
  const handleEditCritters = (udf: IUDF): void => {
    setCurrentUdf(udf);
    setShowCritterSelection(true);
  };

  // when user clicks save button in critter selection modal, update the current udfs value
  const handleCrittersSelected = (u: IUDF): void => {
    u.changed = true;
    setShowCritterSelection(false);
    const idx = udfs.findIndex((udf) => udf.key === u.key);
    const cp = [...udfs];
    cp[idx] = u;
    setUdfs(cp);
    setCanSave(true);
  };

  const handleSave = (): void => {
    const udfInput = udfs.map((u) => {
      return { key: u.key, value: u.value, type: u.type };
    });
    mutateAsync(udfInput);
  };

  const onClose = (): void => {
    setCanSave(false);
    handleClose(false);
  };

  // critters are currently fetched only to display something useful (wlh_id)
  // instead of critter_id
  const getCritterNamesFromIDs = (ids: string[]): string[] => {
    const f = critters.filter((c) => ids.includes(c.critter_id));
    return f.map((c) => c.name);
  };

  const renderCrittersAsDropdown = (critters: string[]): JSX.Element => {
    return (
      <FormControl style={{width: '100px'}} size='small' variant='outlined' className={'select-small'}>
        <InputLabel>Show</InputLabel>
        <Select>
          {critters.map((c) => (
            <MenuItem key={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const headers = ['Group Name', 'Animals', '#', 'Edit', 'Delete', 'Duplicate'];
  return (
    <Modal open={open} handleClose={onClose}>
      {isLoading ? <CircularProgress /> : null}
      <MuiTable className={'udf-table'}>
        <TableHead>
          <TableRow>
            {headers.map((h, idx) => (
              <TableCell align='center' key={idx}>
                <strong>{h}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* iterate the UDFs */}
          {udfs.map((u, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell>
                  {/* the UDF name text field */}
                  <TextField
                    changeHandler={(v): void => handleChangeName(v, u)}
                    propName={'group'}
                    defaultValue={u.key}></TextField>
                </TableCell>
                {/* the dropdown that displays the animal IDs contained in the group */}
                <TableCell>{renderCrittersAsDropdown(getCritterNamesFromIDs(u.value))}</TableCell>
                <TableCell>{u.value.length}</TableCell>
                {/* show the critter selection modal when edit is clicked */}
                <TableCell>
                  <IconButton onClick={(): void => handleEditCritters(u)}>
                    <Icon icon='edit' />
                  </IconButton>
                </TableCell>
                {/* delete this row */}
                <TableCell>
                  <IconButton onClick={(): void => deleteRow(u)}>
                    <Icon icon='close' />
                  </IconButton>
                </TableCell>
                {/* duplicate this row */}
                <TableCell>
                  <IconButton
                    disabled={u.value.length === 0 || u.key.length === 0}
                    onClick={(): void => duplicateRow(u)}>
                    <Icon icon='copy' />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </MuiTable>
      {currentUdf ? (
        <PickCritters
          open={showCritterSelection}
          handleClose={(): void => setShowCritterSelection(false)}
          onSave={handleCrittersSelected}
          udf={currentUdf}
        />
      ) : null}
      <div className={'side-btns'}>
        <Button onClick={addRow} color='primary' variant='outlined'>
          Add Row
        </Button>
        <Button disabled={!canSave} onClick={handleSave} color='primary' variant='contained'>
          Save
        </Button>
      </div>
    </Modal>
  );
}

/**
 * the critter selection modal that appears when the user clicks the edit icon
 * displays a list of critters the user has access to
 * fixme: takes two clicks to unselect default selected values
 */

type PickCritterProps = ModalBaseProps & {
  udf: IUDF;
  onSave: (udf: IUDF) => void;
};

function PickCritters({ open, handleClose, onSave, udf }: PickCritterProps): JSX.Element {
  const useUser = useContext(UserContext);
  const bctwApi = useTelemetryApi();
  const [ids, setIds] = useState<string[]>([]);
  const [wasChanged, setWasChanged] = useState<boolean>(false);

  const tableProps: ITableQueryProps<UserCritterAccess> = {
    query: bctwApi.useCritterAccess,
    param: { user: useUser.user?.idir, filterOutNone: true }
  };

  /**
   * fixme: when udf.value is empty, table handler for multiselection is
   * not passing ids to {handleSelect}
   * so @param values can be string[] | UserCritterAccess[]
   */
  const handleSelect = (values: unknown): void => {
    setWasChanged(true);
    if (udf.value.length === 0) {
      setIds((values as UserCritterAccess[]).map((v) => v.critter_id));
    } else {
      setIds(values as string[]);
    }
  };

  const handleSave = (): void => {
    const n = { ...udf, ...{ value: ids } };
    onSave(n);
    beforeClose();
  };

  const beforeClose = (): void => {
    setWasChanged(false);
    handleClose(false);
  };

  return (
    <Modal open={open} handleClose={beforeClose}>
      <Table
        headers={['animal_id', 'wlh_id', 'device_id', 'frequency']}
        title={`Select Animals For Group ${udf.key}`}
        queryProps={tableProps}
        onSelectMultiple={handleSelect}
        isMultiSelect={true}
        // fixme: see handleSelect issue
        alreadySelected={udf.value}
      />
      <div className={'admin-btn-row'}>
        <Button disabled={!wasChanged} onClick={handleSave}>
          save
        </Button>
      </div>
    </Modal>
  );
}
