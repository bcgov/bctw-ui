import { CircularProgress, IconButton, MenuItem, Select, Typography } from '@material-ui/core';
import { List } from 'components/common';
import { Icon, NotificationMessage } from 'components/common';
import TextField from 'components/form/TextInput';
import ConfirmModal from 'components/modal/ConfirmModal';
import EditTable from 'components/table/EditTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { useState, useEffect } from 'react';
import { getUniqueValuesOfT } from 'types/common_helpers';
import {
  groupPermissionRequests,
  IExecutePermissionRequest,
  IGroupedRequest,
  ReasonsPermissionWasDenied
} from 'types/permission';
import { formatAxiosError } from 'utils/common';

/**
 * page that an admin uses to grant or deny permission requests from owners
 */
export default function AdminHandleRequestPermissionPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const { data, status, error } = bctwApi.usePermissionRequests();
  const [requests, setRequests] = useState<IGroupedRequest[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [isGrant, setIsGrant] = useState(false);
  const [denyReason, setDenyReason] = useState(ReasonsPermissionWasDenied[0]);
  const [selectedRequestID, setSelectedRequestID] = useState<number>();

  useEffect(() => {
    if (data) {
      setRequests(groupPermissionRequests(data));
    }
  }, [data]);

  // set permission request state on fetch
  useDidMountEffect(() => {
    if (status === 'success') {
      // console.log('permission requests retrieved', data);
      setRequests(groupPermissionRequests(data));
    } else {
      // console.log(data, error);
      responseDispatch({ severity: 'error', message: 'error retrieving permission requests' });
    }
  }, [status]);

  const onSuccess = (): void => {
    setRequests((o) => o.filter((req) => req.id !== selectedRequestID));
    responseDispatch({ severity: 'success', message: 'permission request handled succssfully' });
  };

  const onError = (err): void => {
    // console.error(err);
    responseDispatch({ severity: 'error', message: formatAxiosError(err) });
  };

  const { mutateAsync, isLoading } = bctwApi.useMutateTakeActionOnPermissionRequest({ onSuccess, onError });

  // submit the POST request when the grant/deny is confirmed in modal
  const handleGrantOrDenyPermission = async (): Promise<void> => {
    const body: IExecutePermissionRequest = {
      request_id: selectedRequestID,
      is_grant: isGrant,
      was_denied_reason: denyReason
    };
    // console.log('handle grant or deny permission', JSON.stringify(body, null, 2));
    setShowConfirmModal(false);
    await mutateAsync(body);
  };

  // when the grant/deny icons are checked, show a confirmation modal
  const handleShowConfirm = (request: IGroupedRequest, isGrant: boolean): void => {
    setIsGrant(isGrant);
    setSelectedRequestID(request.id);
    setShowConfirmModal((o) => !o);
  };

  const ays = 'Are you sure you wish to';
  const confirmDenyMesg = `${ays} deny this permission request?`;
  const confirmGrantMesg = `${ays} accept this permission request?`;

  /** columns to render in edit table */
  const Emails = (u: IGroupedRequest): JSX.Element => (
    <List values={getUniqueValuesOfT(u.requests, 'requested_for_email')} />
  );
  const AnimalID = (u: IGroupedRequest): JSX.Element => <List values={getUniqueValuesOfT(u.requests, 'animal_id')} />;
  const WLHID = (u: IGroupedRequest): JSX.Element => <List values={getUniqueValuesOfT(u.requests, 'wlh_id')} />;
  const Perm = (u: IGroupedRequest): JSX.Element => <List values={getUniqueValuesOfT(u.requests, 'permission_type')} />;
  const RequestID = (u: IGroupedRequest): JSX.Element => <>{u.id}</>;
  const RequestedBy = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].requested_by_email}</>;
  const Comment = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].request_comment}</>;
  const GrantPermission = (u: IGroupedRequest): JSX.Element => {
    return (
      <IconButton onClick={(): void => handleShowConfirm(u, true)}>
        <Icon icon='done' htmlColor='green' />
      </IconButton>
    );
  };

  const DenyMessage = (
    <>
      <Typography>{confirmDenyMesg}</Typography>
      <Typography>Please select a reason you are denying the request:</Typography>
      <Select 
        variant={'outlined'}
        value={denyReason}
        style={{width: '80%', marginBottom: '10px'}}
        onChange={(e):void => setDenyReason(e.target.value as string)}
      >
        {ReasonsPermissionWasDenied.map((reason, idx) => {
          return (
            <MenuItem key={idx} value={reason} >
              {reason}
            </MenuItem>
          );
        })}
      </Select>
      <Typography>Or input an option below:</Typography>
      <TextField
        style={{marginTop: '5px'}}
        propName={'deny'}
        changeHandler={(v: {deny: string}): void => setDenyReason(v['deny'])}
        defaultValue={''}
        placeholder={'Enter Reason'}
      />
    </>
  );

  const headers: string[] = [
    'ID',
    'Requested By',
    'Email',
    'Animal ID',
    'WLH ID',
    'Permission',
    'Comment',
    'Grant',
    'Deny'
  ];
  return (
    <AuthLayout>
      {status === 'error' && error ? (
        <NotificationMessage severity={'error'} message={formatAxiosError(error)} />
      ) : (
        <>
          <Typography variant='h4'>Grant or deny manager permission requests</Typography>
          {requests.length === 0 ? (
            <Typography>no pending requests</Typography>
          ) : (
            <EditTable
              columns={[RequestID, RequestedBy, Emails, AnimalID, WLHID, Perm, Comment, GrantPermission]}
              canSave={false}
              hideSave={true}
              data={requests as unknown[]}
              headers={headers}
              onSave={null}
              onRowModified={(u): void => handleShowConfirm(u as IGroupedRequest, false)}
              hideAdd={true}
              hideEdit={true}
              hideDuplicate={true}
            />
          )}
          {isLoading ? (
            <CircularProgress />
          ) : (
            <ConfirmModal
              handleClickYes={handleGrantOrDenyPermission}
              title={isGrant ? 'Confirm Grant Permission' : 'Confirm Deny Permission'}
              message={isGrant ? confirmGrantMesg : DenyMessage}
              open={showConfirmModal}
              handleClose={(): void => setShowConfirmModal(false)}
            />
          )}
        </>
      )}
    </AuthLayout>
  );
}
