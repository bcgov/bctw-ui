import { useContext, useEffect, useState } from 'react';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IconButton, Table as MuiTable, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { eUDFType, IUDF } from 'types/udf';
import { ITableQueryProps } from 'components/table/table_interfaces';
import { UserContext } from 'contexts/UserContext';
import Modal from 'components/modal/Modal';
import TextField from 'components/form/Input';
import { UserCritterAccess } from 'types/user';
import { Icon } from 'components/common';
import Table from 'components/table/Table';
import Button from 'components/form/Button';
import { ModalBaseProps } from 'components/component_interfaces';
import { useQueryClient } from 'react-query';
import { useResponseDispatch } from 'contexts/ApiResponseContext';

/**
 * fixme: when table default selected is [], it wont pass ids 
 */
export default function AddUDF({ open, handleClose }: ModalBaseProps): JSX.Element {
  const bctwApi = useTelemetryApi();
  const queryClient = useQueryClient();
  const responseDispatch = useResponseDispatch();
  const [critters, setCritters] = useState<UserCritterAccess[]>([]);
  const useUser = useContext(UserContext);
  const [udfs, setUdfs] = useState<IUDF[]>([]);
  const [showCritterSelection, setShowCritterSelection] = useState<boolean>(false);
  const [currentUdf, setCurrentUdf] = useState<IUDF>(null);

  const { data: udfResults, status: udfStatus } = bctwApi.useUDF(eUDFType.critter_group);
  const { data: critterResults, status: critterStatus } = bctwApi.useCritterAccess(0, {
    user: useUser.user?.idir ?? '',
    filterOutNone: true
  });

  useEffect(() => {
    if (udfStatus === 'success') {
      setUdfs(udfResults);
      if (!udfResults.length) {
        addRow();
      }
    }
  }, [udfStatus]);

  useEffect(() => {
    if (critterStatus === 'success') {
      setCritters(critterResults);
    }
  });

  const onSuccess = (p): void => {
    responseDispatch({type: 'success', message: 'user defined groups saved!'})
    queryClient.invalidateQueries('getUDF');
  }

  const onError = (e): void => {
    responseDispatch({type: 'error', message: `failed to save user defined group: ${e}`})
  }

  const { mutateAsync } = bctwApi.useMutateUDF({ onSuccess, onError });

  const addRow = (): void => {
    const curUdfs = [...udfs];
    curUdfs.push({ udf_id: 0, user_id: 0, type: eUDFType.critter_group, key: '', value: [], changed: true });
    setUdfs(curUdfs);
  };

  const deleteRow = (u: IUDF): void => {
    setUdfs(udfs.filter((udf) => udf.key !== u.key));
  };

  const beforeCloseModal = (): void => {
    handleClose(false);
  }

  // when user changes the group textfield
  const handleChangeName = (v: Record<string, unknown>, udf: IUDF): void => {
    const newKey = v['group'] as string;
    if (!newKey) {
      return;
    }
    const idx = udfs.findIndex((u) => u.key === udf.key);
    const cp = [...udfs];
    cp[idx].key = newKey;
    cp[idx].changed = true;
    setUdfs(cp);
  };

  /**
   * when the user clicks the edit button for a udf in the table
   * */
  const handleEditCritters = (udf: IUDF): void => {
    setCurrentUdf(udf);
    setShowCritterSelection(true);
  };

  // when user clicks save button in critter selection modal
  const handleCrittersSelected = (u: IUDF): void => {
    // console.log(u.value)
    u.changed = true;
    // setWasChanged(true);
    setShowCritterSelection(false);
    const idx = udfs.findIndex((udf) => udf.key === u.key);
    const cp = [...udfs];
    cp[idx] = u;
    setUdfs(cp);
  };

  const handleSave = (): void => {
    // fixme: ? currently replacing all, so dont filter out only changed
    // const toSave = udfs.filter(u => u.changed);
    const prep = udfs.map(u => {
      return {key: u.key, value: u.value, type: u.type}
    });
    // console.log(prep);
    mutateAsync(prep);
  }

  const getCritterNamesFromIDs = (ids: string[]): string => {
    const f = critters.filter((c) => ids.includes(c.critter_id));
    return f.map((c) => c.name).join(', ');
  };

  const headers = ['Group Name', 'Animals', '# Animals', 'Edit', 'Delete'];
  return (
    <Modal open={open} handleClose={beforeCloseModal}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {headers.map((h, idx) => (
              <TableCell key={idx}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {udfs.map((u, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    changeHandler={(v): void => handleChangeName(v, u)}
                    propName={'group'}
                    value={u.key}></TextField>
                </TableCell>
                <TableCell>{getCritterNamesFromIDs(u.value)}</TableCell>
                <TableCell>{u.value.length}</TableCell>
                <TableCell>
                  <IconButton onClick={(): void => handleEditCritters(u)}>
                    <Icon icon='edit' />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton onClick={(): void => deleteRow(u)}>
                    <Icon icon='close' />
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
        <Button disabled={udfs.filter(u => u.changed).length === 0} onClick={handleSave} color='primary' variant='contained'>
          Save
        </Button>
      </div>
    </Modal>
  );
}

/**
 *
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

  const handleSelect = (values): void => {
    // console.log('selected in table', values);
    setWasChanged(true);
    setIds(values);
  };

  const handleSave = (): void => {
    const n = { ...udf, ...{ value: ids } };
    onSave(n);
  };

  return (
    <Modal open={open} handleClose={handleClose}>
      <Table
        headers={['animal_id', 'wlh_id', 'nickname', 'device_id', 'critter_id']}
        title={`Select Animals For Group ${udf.key}`}
        queryProps={tableProps}
        onSelectMultiple={handleSelect}
        isMultiSelect={true}
        alreadySelected={udf.value}
      />
      <Button disabled={!wasChanged} onClick={handleSave}>
        save
      </Button>
    </Modal>
  );
}
