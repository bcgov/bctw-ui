import { useContext, useEffect, useState } from 'react';
import { CircularProgress, IconButton, TableHead } from '@material-ui/core';
import { TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import { dateObjectToTimeStr } from 'utils/time';
import { Icon } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import MortalityEventForm from 'pages/data/events/MortalityEventForm';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { IBulkUploadResults } from 'api/api_interfaces';
import MortalityEvent from 'types/mortality_event';

export default function AlertPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const useAlerts = useContext(AlertContext);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  // alert selected in table
  const [selectedAlert, setSelectedAlert] = useState<TelemetryAlert>(null);
  // display status of the modal that the user can perform the alert update from. ex - mortality
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  // display status of the modal that requires the user to confirm the 'snooze alert' action
  const [showSnoozeModal, setShowSnoozeModal] = useState<boolean>(false);
  const [snoozeMessage, setSnoozeMessage] = useState<string>('');

  useEffect(() => {
    const update = (): void => {
      setAlerts(useAlerts?.alerts);
    };
    update();
  }, [useAlerts]);

  const onAlertSaved = async (): Promise<void> => {
    responseDispatch({ severity: 'success', message: `telemetry alert saved` });
  };

  const onMortalitySaved = async (data: IBulkUploadResults<unknown>): Promise<void> => {
    // console.log('data returned from mortality alert context', data);
    const { errors, results } = data;
    if (errors.length) {
      responseDispatch({ severity: 'error', message: `${errors.map((e) => e.error)}` });
    } else if (results.length) {
      responseDispatch({ severity: 'success', message: 'mortality event saved!' });
      // console.log(selectedAlert);
      // expire the telemetry alert
      const a = Object.assign(new TelemetryAlert(), selectedAlert);
      a.expireAlert(); // updates the expiry date
      await updateAlert(a);
    }
  };

  const onError = (error: AxiosError): void => responseDispatch({ severity: 'error', message: formatAxiosError(error) });

  // setup the mutations
  const { mutateAsync: saveAlert, isLoading: isSavingAlert } = bctwApi.useMutateUserAlert({
    onSuccess: onAlertSaved,
    onError
  });
  const { mutateAsync: saveMortality } = bctwApi.useMutateMortalityEvent({ onSuccess: onMortalitySaved, onError });

  const handleSelectRow = (aid: number): void => {
    const selected = alerts.find((a) => a.alert_id === aid);
    setSelectedAlert(selected);
  };

  /**
   * performs metadata updates of collar/critter
   */
  const handleSave = async (event: MortalityEvent): Promise<void> => {
    if (event) {
      await saveMortality(event);
    }
  };

  /**
   * posts the updated alert to API
   */
  const updateAlert = async (alert: TelemetryAlert): Promise<void> => {
    console.log('saving this alert', alert.toJSON());
    await saveAlert([alert]);
    // trigger the alert context to refetch
    useAlerts.invalidate();
  };

  // user selected to take action on the alert, show the update modal
  const editAlert = (row: TelemetryAlert): void => {
    setSelectedAlert(row);
    setShowUpdateModal(true);
  };

  // show the modal that requires the user to confirm the snooze action
  const handleClickSnooze = (alert: TelemetryAlert): void => {
    setSnoozeMessage(UserAlertStrings.snoozeConfirmation(alert.snoozesMax - alert.snooze_count));
    setSelectedAlert(alert);
    setShowSnoozeModal(true);
  };

  // when the snooze action is confirmed, update the snooze and call {updateAlert}
  const handleConfirmSnooze = async (): Promise<void> => {
    const snoozed = Object.assign(new TelemetryAlert(), selectedAlert);
    snoozed.performSnooze();
    await updateAlert(snoozed);
    setShowSnoozeModal(false);
  };

  const propsToShow = [
    'WLH ID',
    'animal_id',
    'device_id',
    'device_make',
    'alert_type',
    'valid_from',
    'update',
    'Snooze Status',
    'Snooze Action'
  ];

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }

  return (
    <div className={'container'}>
      <Box p={1}>
        {isSavingAlert ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper} style={{padding: '3px'}}>
            <Table>
              <TableHead>
                <TableRow>
                  {propsToShow.map((str, idx) => {
                    return <TableCell key={idx}>{TelemetryAlert.formatPropAsHeader(str)}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((a) => {
                  return (
                    <TableRow
                      className={a?.alert_id === selectedAlert?.alert_id ? 'row-selected' : ''}
                      // highlight when there are no snoozes left
                      style={
                        a.snoozesAvailable === 0 && !a.isSnoozed
                          ? { border: '3px solid orange', backgroundColor: 'rgba(255,204,0,0.4)' }
                          : {}
                      }
                      onClick={(): void => handleSelectRow(a.alert_id)}
                      hover
                      key={a.alert_id}>
                      <TableCell>{a.wlh_id}</TableCell>
                      <TableCell>{a.animal_id}</TableCell>
                      <TableCell>{a.device_id}</TableCell>
                      <TableCell>{a.device_make}</TableCell>
                      <TableCell style={{ color: 'red' }}>
                        <strong>{a.formatAlert}</strong>
                      </TableCell>
                      <TableCell>{dateObjectToTimeStr(a.valid_from)}</TableCell>
                      <TableCell>
                        <IconButton onClick={(): void => editAlert(a)}>
                          <Icon icon='edit' />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {a.snooze_count === a.snoozesMax ? <b>{a.snoozeStatus}</b> : a.snoozeStatus}
                      </TableCell>
                      <TableCell>
                        {!a.isSnoozed && a.snoozesAvailable === 0 ? (
                          <IconButton disabled={true}>
                            <Icon icon='warning'></Icon>
                          </IconButton>
                        ) : a.isSnoozed ? null : a.snoozesAvailable > 0 ? (
                          <IconButton onClick={(): void => handleClickSnooze(a)}>
                            <Icon icon='snooze' />
                          </IconButton>
                        ) : (
                          <IconButton disabled={true}>
                            <Icon icon='cannotSnooze' />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <ConfirmModal
        handleClickYes={handleConfirmSnooze}
        handleClose={(): void => setShowSnoozeModal(false)}
        message={snoozeMessage}
        open={showSnoozeModal}
      />
      {selectedAlert ? (
        <MortalityEventForm
          alert={selectedAlert}
          open={showUpdateModal}
          handleClose={(): void => setShowUpdateModal(false)}
          handleSave={handleSave}
        />
      ) : null}
    </div>
  );
}
