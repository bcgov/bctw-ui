import { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, TableCell, Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import OwnerLayout from 'pages/layouts/OwnerLayout';
import { eCritterPermission, PermissionRequestInput } from 'types/permission';
import PickCritterPermissionModal from './PickCritterPermissionModal';
import TextField from 'components/form/TextInput';
import EditTable, { EditTableRowAction } from 'components/table/EditTable';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { IUserCritterAccessInput } from 'types/user';
import { IUserCritterPermissionInput } from 'api/api_interfaces';

/**
 * fixme: incomplete
 */
export default function OwnerRequestPermission(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const [requestBeingEdited ] = useState<PermissionRequestInput[]>([
    new PermissionRequestInput()
  ]);
  const [showPickCritterModal, setShowPickCritterModal] = useState<boolean>(false);

  const [permission, setPermission] = useState<IUserCritterPermissionInput>();

  const [emailList, setEmailList] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');

  const handleCrittersSelected = (ca: IUserCritterPermissionInput): void => {
    setPermission(ca);
  };

  const handleAddEmail = (): void => {
    if (!emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
      responseDispatch({type: 'success', message: `${email} added`});
    }
  };

  const renderEmailField = (): JSX.Element => {
    return (
      <TableCell>
        <TextField
          label='Enter an email address'
          type='email'
          propName='email'
          changeHandler={(t): void => setEmail(t['email'] as string)}
          defaultValue={email}
        />
        <Button disabled={!email.length} onClick={handleAddEmail}>Add Email</Button>
      </TableCell>
    );
  };

  /**
   */
  const renderList = (type: 'emails' | 'critters'): JSX.Element => {
    return (
      <TableCell>
        <FormControl style={{ width: '200px' }} size='small' variant='outlined' className={'select-small'}>
          <InputLabel>{type === 'emails' ? `Show Emails` : `Show Permissions`}</InputLabel>
          <Select>
            {type === 'emails'
              ? emailList.map((e, i) => <MenuItem key={`email_${i}`}>{e}</MenuItem>)
              : permission?.access.map((c, i) => <MenuItem key={`critter_${i}`}>{c.animal_id ?? c.wlh_id ?? c.critter_id}</MenuItem>)}
            {}
          </Select>
        </FormControl>
      </TableCell>
    );
  };
  const renderEmailList = (): JSX.Element => renderList('emails');
  const renderCritterList = (): JSX.Element => renderList('critters');

  const renderEmailCount = (): JSX.Element => <TableCell>{emailList.length ?? 0}</TableCell>;
  const renderCritterCount = (): JSX.Element => <TableCell>{permission?.access.length ?? 0}</TableCell>;

  const handleRowModified = (r: unknown, action: EditTableRowAction): void => {
    switch (action) {
      case 'edit':
        setShowPickCritterModal((o) => !o);
        break;
      case 'reset':
        setEmail('');
        setEmailList([]);
    }
  };

  return (
    <OwnerLayout>
      <>
        <Typography variant='h4'>Grant animal permissions to other users</Typography>
        <Typography>Submit a new permission request</Typography>
        <EditTable
          canSave={true}
          columns={[renderEmailField, renderEmailList, renderEmailCount, renderCritterList, renderCritterCount]}
          data={[requestBeingEdited]}
          headers={[]}
          onRowModified={handleRowModified}
          onSave={null}
          hideAdd={true}
          hideDelete={true}
          hideDuplicate={true}
          showReset={true}
        />
        <Typography>View past permission requests</Typography>
        <div>todo:...</div>
        <PickCritterPermissionModal
          open={showPickCritterModal}
          handleClose={(): void => setShowPickCritterModal(false)}
          onSave={handleCrittersSelected}
          alreadySelected={[]}
          filter={[eCritterPermission.owner]}
          title={`Select Animals`}
          showSelectPermission={true}
        />
      </>
    </OwnerLayout>
  );
}
