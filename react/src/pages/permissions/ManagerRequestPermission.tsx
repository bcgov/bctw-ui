import { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import ManagerLayout from 'pages/layouts/ManagerLayout';
import { eCritterPermission, IPermissionRequestInput, IUserCritterPermissionInput, managerPermissionOptions, PermissionRequest, PermissionRequestInput } from 'types/permission';
import PickCritterPermissionModal from './PickCritterPermissionModal';
import TextField from 'components/form/TextInput';
import EditTable, { EditTableRowAction } from 'components/table/EditTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/errors';
import { Button, Icon, NotificationMessage } from 'components/common';
import useDidMountEffect from 'hooks/useDidMountEffect';
import DataTable from 'components/table/DataTable';
import { IUserCritterAccessInput, UserCritterAccess } from 'types/animal_access';
import { AnimalDelegationSteps } from 'constants/strings';

/**
 * Page that allows an manager to submit a request to grant other users animal permissions 
*/
export default function ManagerRequestPermission(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();

  const [showPickCritterModal, setShowPickCritterModal] = useState(false);

  const [permission, setPermission] = useState<IUserCritterPermissionInput>();

  const [emailList, setEmailList] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState(false);
  const [comment, setComment] = useState('');

  const [error, setError] = useState('');

  // reset error on changing emails
  useDidMountEffect(() => {
    setError('');
  }, [emailList])

  const onSuccess = (data): void => {
    // eslint-disable-next-line no-console
    console.log('successful request submission', data);
    showNotif({severity: 'success', message: 'permission request submitted succssfully'});
    setError('');
    reset();
  }

  const onError = (err: AxiosError): void => {
    // console.log(err)
    setError(err?.response?.data);
    showNotif({severity: 'error', message: formatAxiosError(err)});
  }

  // setup the API call to POST the permission request
  const { mutateAsync } = api.useSubmitPermissionRequest({ onSuccess, onError });

  // set the selected permission state when saved from the picker modal
  const handleCrittersSelected = (ca: IUserCritterPermissionInput): void => {
    // console.log(ca);
    setPermission(ca);
    setShowPickCritterModal(false);
  };

  // enable the add button if the email is valid
  const handleAddEmail = (): void => {
    if (!emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
      showNotif({ severity: 'info', message: `${email} added` });
    }
  };

  // edit table handlers
  const handleRowModified = (r: unknown, action: EditTableRowAction): void => {
    switch (action) {
      case 'edit':
        setShowPickCritterModal((o) => !o);
        break;
      case 'reset':
        reset();
    }
  };

  // when the reset button is clicked, reset the state
  const reset = (): void => {
    setEmail('');
    setEmailList([]);
    const u = Object.assign({}, permission);
    if (u.access?.length) {
      u.access.length = 0;
    }
    setPermission(u);
  };

  const handleSavePermission = async (): Promise<void> => {
    const body: IPermissionRequestInput = {
      user_email_list: emailList,
      critter_permissions_list: permission.access,
    }
    // console.log(JSON.stringify(body, null, 2))
    mutateAsync(body);
  }

  /** components passed to be rendered in the edit table */
  const EmailField = (): JSX.Element => {
    const prop = 'email';
    const onChange = (v): void => {
      setEmailErr(v.error);
      setEmail(v[prop]);
    };
    return (
      <TextField
        label='Enter an email address'
        type={prop}
        propName={prop}
        changeHandler={onChange}
        defaultValue={email}
      />
    );
  };

  const CommentField = (): JSX.Element => {
    return (
      <TextField
        propName={'comment'}
        changeHandler={(v: unknown): void => setComment(v['comment'])}
        defaultValue={comment}
        multiline={true}
        rows={2}
      />
    )
  }

  const listStyle = { listStyle: 'none', minWidth: '200px', maxWidth: '300px'};
  const EmailList = (): JSX.Element => {
    return (
      <ul style={listStyle}>
        {emailList.length ? (
          emailList.map((e) => (
            <li>{e}
              <IconButton size='small' onClick={():void => setEmailList([...emailList.filter(em => em !== e)])}>
                <Icon icon='close' htmlColor='red' />
              </IconButton>
            </li>
          ))
        ) : (
          <li style={{width: '200px'}}></li>
        )}
      </ul>
    );
  };

  const PermissionList = (): JSX.Element => {
    const p = permission?.access;
    return (
      p?.length ? (
        <ul style={listStyle}>
          {p.map((e) => (
            <li>{e.permission_type}</li>
          ))}
        </ul>
      ) : null
    );
  };

  const CritterList = (): JSX.Element => {
    const p = permission?.access;
    return (
      p?.length ? (
        <ul style={listStyle}>
          {p.map((e) => (
            <li>{e.animal_id ? `Animal ID: ${e.animal_id}` : e.wlh_id ? `WLH_ID: ${e.wlh_id}` : `no animal`}</li>
          ))}
        </ul>
      ) : null
    );
  };

  const AddEmailBtn = (): JSX.Element => (
    <Button size='small' disabled={!email.length || emailErr} onClick={handleAddEmail}>
      Add
    </Button>
  );

  // the submit button state
  const canSubmitRequest = (): boolean => {
    const access = permission?.access ?? [];
    access.forEach((a: IUserCritterAccessInput) => {
      if (!managerPermissionOptions.includes(a.permission_type)) {
        return false;
      }
    })
    return !!(emailList.length && access.length)
  }

  return (
    <ManagerLayout>
      <div className='container'>
        <h1>Delegation</h1>
        <Typography variant='body1' component='p'>Submit a new animal permission request for another user</Typography>
        <ol>
          {
            AnimalDelegationSteps.map((step: string, idx: number) => <li key={idx}>{step}</li>)
          }
        </ol>
        <EditTable
          canSave={canSubmitRequest()}
          columns={[EmailField, AddEmailBtn, EmailList, CritterList, PermissionList, CommentField]}
          data={[new PermissionRequestInput()]}
          headers={['', '', 'Emails', 'Animal Identifier', 'Permission', 'Comment', 'Edit', 'Reset']}
          onRowModified={handleRowModified}
          onSave={handleSavePermission}
          hideAdd={true}
          hideDelete={true}
          hideDuplicate={true}
          showReset={true}
          saveButtonText={'Submit Permission Request'}
        />
        <PickCritterPermissionModal
          open={showPickCritterModal}
          handleClose={(): void => setShowPickCritterModal(false)}
          onSave={handleCrittersSelected}
          alreadySelected={permission?.access?.map((a) => a.critter_id)}
          filter={[eCritterPermission.manager]}
          title={`Select Animals`}
          showSelectPermission={true}
          headersToShow={UserCritterAccess.propsToDisplay.filter((p: keyof UserCritterAccess) => p !== 'permission_type')}
        />
        {
          error ? (
            <div style={{ marginBottom: '10px' }}>
              <NotificationMessage
                severity={'error'}
                message={error}
              />
            </div>
          ) : null
        }
        <DataTable
          title={'Submitted Permission History'}
          headers={PermissionRequest.managerHistoryPropsToDisplay}
          queryProps={{ query: api.usePermissionHistory}}
        />
      </div>
    </ManagerLayout>
  );
}
