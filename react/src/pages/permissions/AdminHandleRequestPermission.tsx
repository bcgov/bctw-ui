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
import { getUniqueValuesOfT } from 'utils/common_helpers';
import {
  groupPermissionRequests,
  IExecutePermissionRequest,
  IGroupedRequest,
  permissionDeniedReasons,
  PermissionWasDeniedReason
} from 'types/permission';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { formatDay } from 'utils/time';
import { isDev } from 'api/api_helpers';

/**
 * page that an admin uses to grant or deny permission requests from owners
 */
export default function AdminHandleRequestPermissionPage(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const { data, status, error } = api.usePermissionRequests();
  const [requests, setRequests] = useState<IGroupedRequest[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [isGrant, setIsGrant] = useState(false);
  const [denyReason, setDenyReason] = useState<PermissionWasDeniedReason>('Not given');
  const [selectedRequestID, setSelectedRequestID] = useState<number>();

  useEffect(() => {
    if (data) {
      setRequests(groupPermissionRequests(data));
    }
  }, [data]);

  // set permission request state on fetch
  useDidMountEffect(() => {
    if (status === 'success' && data) {
      setRequests(groupPermissionRequests(data));
    } else {
      showNotif({ severity: 'error', message: 'error retrieving permission requests' });
    }
  }, [status]);

  const onSuccess = (): void => {
    setRequests((o) => o.filter((req) => req.id !== selectedRequestID));
    showNotif({ severity: 'success', message: 'permission request handled successfully' });
  };

  const onError = (err: AxiosError): void => {
    showNotif({ severity: 'error', message: formatAxiosError(err) });
  };

  const { mutateAsync, isLoading } = api.useTakeActionOnPermissionRequest({ onSuccess, onError });

  // submit when grant/deny is confirmed in the modal
  const handleGrantOrDenyPermission = async (): Promise<void> => {
    if (!selectedRequestID) {
      return;
    }
    const body: IExecutePermissionRequest = {
      request_id: selectedRequestID,
      is_grant: isGrant,
      was_denied_reason: denyReason
    };
    // console.log('handle grant or deny permission', JSON.stringify(body, null, 2));
    setShowConfirmModal(false);
    await mutateAsync(body);
  };

  // if a grant/deny icon is clicked, show a confirmation modal
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
  const RequestedAt = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].requested_date.format(formatDay)}</>;
  const Comment = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].request_comment}</>;
  const GrantPermission = (u: IGroupedRequest): JSX.Element => {
    return (
      <IconButton onClick={(): void => handleShowConfirm(u, true)}>
        <Icon icon='done' htmlColor='green' />
      </IconButton>
    );
  };

  /**
   * when the user selects 'deny', they are presented with a window
   * asking them to enter a reason for the denial
   */
  const DenyConfirmMessage = (
    <>
      <Typography>{confirmDenyMesg}</Typography>
      <Typography>Please select a reason you are denying the request:</Typography>
      <Select
        variant={'outlined'}
        value={denyReason}
        style={{ width: '80%', marginBottom: '10px' }}
        onChange={(e): void => setDenyReason(e.target.value as PermissionWasDeniedReason)}>
        {permissionDeniedReasons.map((reason, idx) => {
          return (
            <MenuItem key={idx} value={reason}>
              {reason}
            </MenuItem>
          );
        })}
      </Select>
      <Typography>Or input an option below:</Typography>
      <TextField
        style={{ marginTop: '5px' }}
        propName={'deny'}
        changeHandler={(v: Record<string, unknown>): void => setDenyReason(v['deny'] as PermissionWasDeniedReason)}
        defaultValue={''}
        placeholder={'Enter Reason'}
      />
    </>
  );

  const headers: string[] = [
    'Requested By',
    'Date',
    'Email',
    'Animal ID',
    'WLH ID',
    'Permission',
    'Comment',
    'Grant',
    'Deny'
  ];
  const columns = [RequestedBy, RequestedAt, Emails, AnimalID, WLHID, Perm, Comment, GrantPermission];

  // also show request id in development
  if (isDev()) {
    headers.unshift('ID');
    columns.unshift(RequestID);
  }

  return (
    <AuthLayout>
      {status === 'error' && error ? (
        <NotificationMessage severity={'error'} message={formatAxiosError(error)} />
      ) : (
        <>
          <h1>Delegation Requests</h1>
          {requests.length === 0 ? (
            <Typography>no pending requests</Typography>
          ) : (
            <EditTable
              headers={headers}
              columns={columns}
              canSave={false}
              hideSave={true}
              data={requests}
              onSave={(): void => { /* do nothing */ }}
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
              message={isGrant ? confirmGrantMesg : DenyConfirmMessage}
              open={showConfirmModal}
              handleClose={(): void => setShowConfirmModal(false)}
            />
          )}
        </>
      )}
    </AuthLayout>
  );
}
