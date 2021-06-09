import { useState } from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import OwnerLayout from 'pages/layouts/OwnerLayout';
import { eCritterPermission, IPermissionRequestInput, PermissionRequestInput } from 'types/permission';
import PickCritterPermissionModal from './PickCritterPermissionModal';
import TextField from 'components/form/TextInput';
import EditTable, { EditTableRowAction } from 'components/table/EditTable';
import Button from 'components/form/Button';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { IUserCritterPermissionInput } from 'api/api_interfaces';
import { AxiosError } from 'axios';
import { formatAxiosError } from 'utils/common';
import { Icon, NotificationMessage } from 'components/common';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import useDidMountEffect from 'hooks/useDidMountEffect';

/**
 *
*/
export default function OwnerRequestPermission(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();

  const [showPickCritterModal, setShowPickCritterModal] = useState<boolean>(false);

  const [permission, setPermission] = useState<IUserCritterPermissionInput>();

  const [emailList, setEmailList] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [emailErr, setEmailErr] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  const [error, setError] = useState<string>('');

  // reset error on changing emails
  useDidMountEffect(() => {
    setError('');
  }, [emailList])

  const onSuccess = (data): void => {
    console.log('successful request submission', data);
    responseDispatch({severity: 'success', message: 'permission request submitted succssfully'});
    setError('');
  }

  const onError = (err: AxiosError): void => {
    console.log(err)
    setError(err?.response?.data);
    responseDispatch({severity: 'error', message: formatAxiosError(err)});
  }

  // setup the API call to POST the permission request
  const { mutateAsync } = bctwApi.useMutateSubmitPermissionRequest({ onSuccess, onError });

  // set the selected permission state when saved from the picker modal
  const handleCrittersSelected = (ca: IUserCritterPermissionInput): void => {
    console.log(ca);
    setPermission(ca);
    setShowPickCritterModal(false);
  };

  // enable the add button if the email is valid
  const handleAddEmail = (): void => {
    if (!emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmail('');
      responseDispatch({ severity: 'info', message: `${email} added` });
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
    const critter_permissions_list = permission.access.map(a => ({animal_id: a.critter_id, permission_type: a.permission_type}));
    const body: IPermissionRequestInput = {
      user_email_list: emailList,
      critter_permissions_list,
    }
    console.log(JSON.stringify(body, null, 2))
    mutateAsync(body);
  }

  /** components passed to be rendered in the edit table */

  const renderEmailField = (): JSX.Element => {
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

  const renderCommentField = (): JSX.Element => {
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

  const listStyle: CSSProperties = { listStyle: 'none', minWidth: '200px', maxWidth: '300px'};
  const renderEmailList = (): JSX.Element => {
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


  const renderPermissionList = (): JSX.Element => {
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

  const renderCritterList = (): JSX.Element => {
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

  const renderAddEmailBtn = (): JSX.Element => (
    <Button disabled={!email.length || emailErr} onClick={handleAddEmail}>
      Add Email
    </Button>
  );

  return (
    <OwnerLayout>
      <>
        <Typography variant='h4'>Grant animal permissions to other users</Typography>
        <Typography>Submit a new permission request. Start by:</Typography>
        <ol>
          <li>Enter a valid email address of the user you wish to give access to</li>
          <li>Click <b>Add Email</b></li>
          <li>Click the <b>Edit</b> icon</li>
          <li>Choose from a list of animals and permissions from the popup</li>
          <li>Click <b>Save</b></li>
          <li>Once complete, click the <b>Submit Permission Request</b> button</li>
          <li>An administrator will be notified of the pending request</li>
        </ol>
        <EditTable
          canSave={!!(emailList.length && permission?.access?.length)}
          columns={[renderEmailField, renderAddEmailBtn, renderEmailList, renderCritterList, renderPermissionList, renderCommentField]}
          data={[new PermissionRequestInput()]}
          headers={['', '', 'Emails', 'Animal Identifier', 'Permission Type', 'Submission Comment', 'Edit', 'Reset']}
          onRowModified={handleRowModified}
          onSave={handleSavePermission}
          hideAdd={true}
          hideDelete={true}
          hideDuplicate={true}
          showReset={true}
          saveButtonText={'Submit Permission Request'}
        />
        {/* todo:... */}
        {/* <Typography>View past permission requests</Typography> */}
        <PickCritterPermissionModal
          open={showPickCritterModal}
          handleClose={(): void => setShowPickCritterModal(false)}
          onSave={handleCrittersSelected}
          alreadySelected={permission?.access?.map((a) => a.critter_id)}
          filter={[eCritterPermission.owner]}
          title={`Select Animals`}
          showSelectPermission={true}
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
      </>
    </OwnerLayout>
  );
}
