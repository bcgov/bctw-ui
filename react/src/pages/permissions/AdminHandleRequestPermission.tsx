import { Box, Button, CircularProgress, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { List } from 'components/common';
import { Icon, NotificationMessage } from 'components/common';
import TextField from 'components/form/TextInput';
import ConfirmModal from 'components/modal/ConfirmModal';
import EditTable from 'components/table/EditTable';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import AuthLayout from 'pages/layouts/AuthLayout';
import { useState, useEffect, useRef } from 'react';
import { doNothing, getUniqueValuesOfT } from 'utils/common_helpers';
import {
  groupPermissionRequests,
  IExecutePermissionRequest,
  IGroupedRequest,
  IPermissionRequest,
  permissionDeniedReasons,
  PermissionRequest,
  PermissionWasDeniedReason
} from 'types/permission';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { formatDay } from 'utils/time';
import { isDev } from 'api/api_helpers';
import { eUserRole } from 'types/user';
import { DelegationRequestStrings as msgStrings } from 'constants/strings';

/**
 * page that an admin uses to grant or deny permission requests from managers
 */
export default function AdminHandleRequestPermissionPage(): JSX.Element {
  const api = useTelemetryApi();
  const showNotif = useResponseDispatch();
  const { data, status, error } = api.usePermissionRequests();
  const [requests, setRequests] = useState<IGroupedRequest[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isGrant, setIsGrant] = useState(false);
  const [denyReason, setDenyReason] = useState<PermissionWasDeniedReason>('Not given');
  //const [selectedRequestID, setSelectedRequestID] = useState<number>();
  const [selectedMultiRequestIDs, setSelectedMultiRequestIDs] = useState<number[]>([]);

  const ref = useRef(null);

  useEffect(() => {
    if (data) {
      setRequests(groupPermissionRequests(data));
    }
  }, [data]);

  // set the permission request state on a successful fetch
  useDidMountEffect(() => {
    if (status === 'success' && data) {
      setRequests(groupPermissionRequests(data));
    } else {
      showNotif({ severity: 'error', message: 'error retrieving permission requests' });
    }
  }, [status]);

  const onSuccess = (data: IExecutePermissionRequest[]): void => {
    const successfulRequests: number[] = [];
    for(const item of data) {
      if('errormsg' in item === false) {
        successfulRequests.push(item.request_id);
      }
    }
    setRequests((o) => o.filter((req) => successfulRequests.indexOf(req.id) === -1));
    setSelectedMultiRequestIDs([]);
    ref?.current?.setSelected([]);
    notifRecurse(data);
  };

  const notifRecurse = (data: IExecutePermissionRequest[]): void => {
    //Each notification will call this function on close, until theres nothing left to notify about
    if (data.length == 0 || data === undefined) return;
    const o: IExecutePermissionRequest = data.shift();
    if ('errormsg' in o) {
      showNotif({
        severity: 'error',
        message: `${o.requested_by_email} failed with: ${o.errormsg}`,
        callback: () => {
          notifRecurse(data);
        }
      });
    } else {
      showNotif({
        severity: 'success',
        message: `Request for ${o.requested_by_email} successful`,
        callback: () => {
          notifRecurse(data);
        }
      });
    }
  };

  const onError = (err: AxiosError): void => {
    showNotif({ severity: 'error', message: formatAxiosError(err) });
  };

  // setup mutation for granting/denying a permission request
  const { mutateAsync, isLoading } = api.useTakeActionOnPermissionRequest({ onSuccess, onError });

  // submit when grant/deny is confirmed in the modal
  const handleGrantOrDenyPermission = async (): Promise<void> => {
    if (/*!selectedRequestID &&*/ selectedMultiRequestIDs.length < 1) {
      return;
    }
    const body: IExecutePermissionRequest[] = selectedMultiRequestIDs.map((id) => ({
      request_id: id,
      is_grant: isGrant,
      was_denied_reason: denyReason
    }));

    setShowConfirmModal(false);
    await mutateAsync(body);
  };

  const handleShowConfirmMultiple = (isGrant: boolean): void => {
    setIsGrant(isGrant);
    setShowConfirmModal((o) => !o);
  };

  //useEffect(()=>console.log(selectedMultiRequestIDs), [selectedMultiRequestIDs]);
  const handleSelectRow = (rows: IGroupedRequest[]): void => {
    if (rows.length) {
      setSelectedMultiRequestIDs(rows.map((u) => u.id));
    } else {
      setSelectedMultiRequestIDs([]);
    }
  };

  const getConfirmMessage = (): string | JSX.Element => {
    if (selectedMultiRequestIDs.length) {
      return isGrant ? msgStrings.confirmDenyMesgMulti(selectedMultiRequestIDs.length) : DenyConfirmMessage;
    } else {
      return isGrant ? msgStrings.confirmGrantMesg : DenyConfirmMessage;
    }
  };

  /** components to render in the edit table */
  const Emails = (u: IGroupedRequest): JSX.Element => (
    <List disableGutters={true} values={getUniqueValuesOfT(u.requests, 'requested_for_email')} />
  );
  const AnimalID = (u: IGroupedRequest): JSX.Element => (
    <List disableGutters={true} values={getUniqueValuesOfT(u.requests, 'animal_id')} />
  );
  const WLHID = (u: IGroupedRequest): JSX.Element => (
    <List disableGutters={true} values={getUniqueValuesOfT(u.requests, 'wlh_id')} />
  );
  const Perm = (u: IGroupedRequest): JSX.Element => (
    <List disableGutters={true} values={getUniqueValuesOfT(u.requests, 'permission_type')} />
  );
  const RequestID = (u: IGroupedRequest): JSX.Element => <>{u.id}</>;
  const RequestedBy = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].requested_by_email}</>;
  const RequestedAt = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].requested_date.format(formatDay)}</>;
  const Comment = (u: IGroupedRequest): JSX.Element => <>{u.requests[0].request_comment}</>;
  /*const GrantPermission = (u: IGroupedRequest): JSX.Element => {
    return (
      <IconButton onClick={(): void => handleShowConfirm(u, true)} size="large">
        <Icon icon='done' htmlColor='green' />
      </IconButton>
    );
  };*/

  /**
   * when the admin chooses to deny, show a modal asking a reason for the denial
   */
  const DenyConfirmMessage = (
    <>
      <Typography>{
        selectedMultiRequestIDs.length > 1 ? 
        msgStrings.confirmDenyMesgMulti(selectedMultiRequestIDs.length)
         : msgStrings.confirmDenyMesg}
        </Typography>
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
    'Comment'
    //'Grant',
    // 'Deny'
  ];

  const columns = [RequestedBy, RequestedAt, Emails, AnimalID, WLHID, Perm, Comment]; //, GrantPermission];

  // also show request id in development
  if (isDev()) {
    headers.unshift('ID');
    columns.unshift(RequestID);
  }

  return (
    <AuthLayout required_user_role={eUserRole.data_administrator}>
      {status === 'error' && error ? (
        <NotificationMessage severity={'error'} message={formatAxiosError(error)} />
      ) : (
        <>
          <h1>Animal Access Delegation Requests</h1>
          <Typography mb={3} variant='body1' component='p'>
            Grant or deny animal access requests from managers.
          </Typography>
          {requests.length === 0 ? (
            <Typography>no pending requests</Typography>
          ) : (
            <EditTable
              headers={headers}
              columns={columns}
              canSave={false}
              hideSave={true}
              data={requests}
              onSave={doNothing}
              onSelectMultiple={(rows: IGroupedRequest[]): void => handleSelectRow(rows)}
              onRowModified={(u): void => {
                //handleShowConfirm(u as IGroupedRequest, false);
              }}
              hideAdd={true}
              hideEdit={true}
              hideDelete={true}
              hideDuplicate={true}
              isMultiSelect={true}
              ref={ref}
            />
            /*<DataTable 
            headers={PermissionRequest.requestHistoryPropsToDisplay}
            title={'Requests'}
            queryProps={tableProps}
            onSelectMultiple={ () => {} }
            isMultiSelect={true}
            customColumns={[{ column:confirmColumn, header: (): JSX.Element => <b>Grant-Deny</b> }]}
            />*/
          )}
          <Box mb={2} display='flex' justifyContent='flex-end' flexDirection='row' alignItems='center' columnGap={2}>
            <Button
              color='primary'
              disabled={selectedMultiRequestIDs.length < 1}
              variant='contained'
              className='form-buttons'
              onClick={() => {
                handleShowConfirmMultiple(true);
              }}>
              Approve Selected
            </Button>
            <Button
              color='primary'
              disabled={selectedMultiRequestIDs.length < 1}
              className='form-buttons'
              variant='contained'
              onClick={() => {
                handleShowConfirmMultiple(false);
              }}>
              Deny Selected
            </Button>
          </Box>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <ConfirmModal
              handleClickYes={handleGrantOrDenyPermission}
              title={isGrant ? 'Confirm Grant Permission' : 'Confirm Deny Permission'}
              message={getConfirmMessage()}
              open={showConfirmModal}
              handleClose={(): void => setShowConfirmModal(false)}
            />
          )}
        </>
      )}
    </AuthLayout>
  );
}
