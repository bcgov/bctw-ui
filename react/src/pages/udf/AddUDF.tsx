import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@material-ui/core';
import { eUDFType, IUDF, UDF } from 'types/udf';
import { UserContext } from 'contexts/UserContext';
import Modal from 'components/modal/Modal';
import TextField from 'components/form/TextInput';
import { UserCritterAccess } from 'types/user';
import { ModalBaseProps } from 'components/component_interfaces';
import { useQueryClient } from 'react-query';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { filterOutNonePermissions } from 'types/permission';
import PickCritterPermissionModal from 'pages/permissions/PickCritterPermissionModal';
import EditTable, { EditTableRowAction } from 'components/table/EditTable';
import { plainToClass } from 'class-transformer';
import { InboundObj } from 'types/form_types';

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

  // fetch UDFs for this user
  const { data: udfResults, status: udfStatus } = bctwApi.useUDF(eUDFType.critter_group);
  // fetch critters only to display something useful (wlh_id) instead of the uuid
  const { data: critterResults, status: critterStatus } = bctwApi.useCritterAccess(
    0, // load all values
    { user: useUser.user },
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
    responseDispatch({ severity: 'success', message: 'user defined groups saved!' });
    queryClient.invalidateQueries('getUDF');
  };

  const onError = (e): void => {
    responseDispatch({ severity: 'error', message: `failed to save user defined group: ${e}` });
  };

  // setup the save mutation to save the UDF
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

  // when the group name textfield is modified, update the udf and allow the form to be saved
  const handleChangeName = (v: InboundObj, udf: IUDF): void => {
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

  /**
   * when user clicks save button in critter selection modal
   * update the current udfs value
  */
  const handleCrittersSelected = (critterIDs: string[]): void => {
    setShowCritterSelection(false);
    const thisUDF = Object.assign({}, currentUdf);
    thisUDF.changed = true;
    thisUDF.value = critterIDs;
    const idx = udfs.findIndex((udf) => udf.key === thisUDF.key);
    const cp = [...udfs];
    cp[idx] = thisUDF;
    setUdfs(cp);
    setCanSave(true);
  };

  /**
   * save the UDFs
  */
  const handleSave = (): void => {
    const udfInput = udfs.map((u) => {
      return { key: u.key, value: u.value, type: u.type };
    });
    mutateAsync(udfInput);
  };

  const onClose = (): void => {
    // setCanSave(false);
    handleClose(false);
  };

  // components to render in the EditTable

  /**
   * displays critter names (wlh_id/animal_id) from a UDFs value,
   * this UDFs value is an array of critter_id
  */
  const renderCrittersAsDropdown = (u: UDF): JSX.Element => {
    if (!u) {
      return <></>
    }
    return (
      <FormControl style={{ width: '100px' }} size='small' variant='outlined' className={'select-small'}>
        <InputLabel>Show</InputLabel>
        <Select disabled={u?.value?.length === 0}>
          {critters
            .filter((c) => u?.value?.includes(c.critter_id))
            .map((c: UserCritterAccess) => (
              <MenuItem key={c.critter_id}>{c.name}</MenuItem>
            ))}
        </Select>
      </FormControl>
    );
  };

  // renders a textfield containing the name of the UDF
  const renderUDFNameField = (u: UDF): JSX.Element => (
    <TextField
      changeHandler={(v): void => handleChangeName(v, u)}
      propName={'group'}
      defaultValue={u.key}
      required={true} />
  )

  // renders a plain table cell 
  const renderNumCrittersSelected = (u: UDF): JSX.Element => <>{u?.value?.length}</>

  const handleRowModified = (u: UDF, action: EditTableRowAction): void => {
    switch (action) {
      case 'add':
        addRow();
        break;
      case 'duplicate':
        duplicateRow(u);
        break;
      case 'delete':
        deleteRow(u);
        break;
      case 'edit':
        handleEditCritters(u);
    }
  }

  const headers = ['Group Name', 'Animals', '#', 'Edit', 'Delete', 'Duplicate'];
  return (
    <Modal open={open} title='Custom Animal Group' handleClose={onClose}>
      {isLoading ? <CircularProgress /> : null}
      <EditTable
        canSave={canSave}
        columns={[
          renderUDFNameField,
          renderCrittersAsDropdown,
          renderNumCrittersSelected
        ]}
        data={udfs.map(d => plainToClass(UDF, d))}
        headers={headers}
        onRowModified={handleRowModified}
        onSave={handleSave}
      />
      {currentUdf ? (
        <PickCritterPermissionModal
          open={showCritterSelection}
          handleClose={(): void => setShowCritterSelection(false)}
          onSave={handleCrittersSelected}
          alreadySelected={currentUdf.value}
          filter={filterOutNonePermissions}
          title={`Select Animals For Group ${currentUdf.key}`}
          showSelectPermission={false}
        />
      ) : null}
    </Modal>
  );
}