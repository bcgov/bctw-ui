import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { CircularProgress } from '@mui/material';
import { eUDFType, IUDF, UDF } from 'types/udf';
import { UserContext } from 'contexts/UserContext';
import Modal from 'components/modal/Modal';
import { UserCritterAccess } from 'types/animal_access';
import { ModalBaseProps } from 'components/component_interfaces';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { filterOutNonePermissions } from 'types/permission';
import PickCritterPermissionModal from 'pages/permissions/PickCritterPermissionModal';
import EditTable, { EditTableRowAction } from 'components/table/EditTable';
import { InboundObj } from 'types/form_types';
import { CritterDropdown, NumSelected, UDFNameField } from 'pages/udf/UDFComponents';

type ManageUDFProps = ModalBaseProps & {
  udf_type: eUDFType;
};

export default function AddUDF({ open, handleClose, udf_type }: ManageUDFProps): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const [critters, setCritters] = useState<UserCritterAccess[]>([]);
  const useUser = useContext(UserContext);
  const [udfs, setUdfs] = useState<UDF[]>([]);
  const [showCritterSelection, setShowCritterSelection] = useState(false);
  const [currentUdf, setCurrentUdf] = useState<IUDF | null>(null);
  const [canSave, setCanSave] = useState(false);
  // collective unit udfs can't be deleted or modified.

  // fetch UDFs for this user
  const { data: udfResults, status: udfStatus } = api.useUDF(udf_type);
  // fetch critters only to display something useful (wlh_id) instead of the uuid
  const { data: critterResults, status: critterStatus } = api.useCritterAccess(
    0, // load all values
    { user: useUser.user }
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

  const onSuccess = (): void => showNotif({ severity: 'success', message: 'user defined groups saved!' });

  const onError = (e): void => showNotif({ severity: 'error', message: `failed to save user defined group: ${e}` });

  // setup the save mutation to save the UDF
  const { mutateAsync, isLoading } = api.useSaveUDF({ onSuccess, onError });

  const addRow = (): void => {
    const curUdfs = [...udfs];
    curUdfs.push({ type: udf_type, key: '', value: [], changed: false } as UDF);
    setUdfs(curUdfs);
  };

  const deleteRow = (u: UDF): void => {
    setUdfs(udfs.filter((udf) => udf.key !== u.key));
    setCanSave(true);
  };

  const duplicateRow = (u: UDF): void => {
    const dup = Object.assign({}, u);
    dup.key = '';
    setUdfs([...udfs, dup]);
  };

  /**
   * when the group name textfield is modified:
   * update the udf and allow the form to be saved
   */
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
  const handleEditCritterGroup = (udf: IUDF): void => {
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
    cp[idx] = thisUDF as any;
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
        handleEditCritterGroup(u);
    }
  };

  const columns = [];
  const headers: string[] = [];
  if (udf_type === eUDFType.critter_group) {
    headers.push('Group Name', 'Animals', '#', 'Edit', 'Delete', 'Duplicate');
    columns.push(
      (u: UDF) => UDFNameField((v) => handleChangeName(v, u), u),
      (u: UDF) => CritterDropdown(critters, u),
      (u: UDF) => NumSelected(u)
    );
  } else if (udf_type === eUDFType.collective_unit) {
    headers.push('to', 'do');
    columns.push();
  }

  return (
    <Modal open={open} title='Custom Animal Group' handleClose={onClose}>
      {isLoading ? <CircularProgress /> : null}
      <EditTable
        canSave={canSave}
        columns={columns}
        data={udfs}
        headers={headers}
        onRowModified={handleRowModified}
        onSave={handleSave}
      />
      {currentUdf ? (
        <PickCritterPermissionModal
          open={showCritterSelection}
          handleClose={(): void => setShowCritterSelection(false)}
          onSave={handleCrittersSelected}
          alreadySelected={currentUdf.value as string[]}
          filter={filterOutNonePermissions}
          title={`Select Animals For Group ${currentUdf.key}`}
          showSelectPermission={false}
        />
      ) : null}
    </Modal>
  );
}
