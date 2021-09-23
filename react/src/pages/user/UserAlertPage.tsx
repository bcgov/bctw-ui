import { useContext, useEffect, useState } from 'react';
import { CircularProgress, IconButton, TableHead } from '@material-ui/core';
import { MortalityAlert, TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import { formatT } from 'utils/time';
import { Icon } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { columnToHeader } from 'utils/common_helpers';
import WorkflowWrapper from 'pages/data/events/WorkflowWrapper';

/**
 * modal component that shows current alerts
 * todo: add support for other alert types
 */
export default function AlertPage(): JSX.Element {
  const bctwApi = useTelemetryApi();
  const responseDispatch = useResponseDispatch();
  const useAlerts = useContext(AlertContext);

  const [alerts, setAlerts] = useState<MortalityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<TelemetryAlert | MortalityAlert>(null);
  // display status of the modal that the user can perform the alert update from
  const [showEventModal, setShowEventModal] = useState(false);
  // display status of the modal that requires the user to confirm snoozing
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeMessage, setSnoozeMessage] = useState('');

  useEffect(() => {
    const update = (): void => {
      const alerts = useAlerts.alerts;
      // console.log('alerts loaded', alerts);
      setAlerts(alerts);
    };
    update();
  }, [useAlerts]);

  const onSuccess = async (): Promise<void> => {
    responseDispatch({ severity: 'success', message: `telemetry alert saved` });
  };

  const onError = (error: AxiosError): void =>
    responseDispatch({ severity: 'error', message: formatAxiosError(error) });

  // setup the mutation to update the alert status
  const { mutateAsync, isLoading } = bctwApi.useMutateUserAlert({ onSuccess, onError });

  // alert is selected in table
  const handleSelectRow = (aid: number): void => {
    const selected = alerts.find((a) => a.alert_id === aid);
    setSelectedAlert(selected);
  };

  // post the updated alert
  const updateAlert = async (alert: TelemetryAlert): Promise<void> => {
    console.log('saving this alert', alert.toJSON());
    await mutateAsync([alert]);
    // trigger the alert context to refetch
    useAlerts.invalidate();
  };

  // user selected to take action on the alert, show the update modal
  const editAlert = (row: TelemetryAlert): void => {
    setSelectedAlert(row);
    setShowEventModal(true);
  };

  // make user confirm the snooze action
  const handleClickSnooze = (alert: TelemetryAlert): void => {
    setSnoozeMessage(UserAlertStrings.snoozeConfirmation(alert.snoozesMax - alert.snooze_count));
    setSelectedAlert(alert);
    setShowSnoozeModal(true);
  };

  // when the snooze action is confirmed, update the snooze and save the alert
  const handleConfirmSnooze = async (): Promise<void> => {
    const snoozed = Object.assign(new TelemetryAlert(), selectedAlert);
    snoozed.performSnooze();
    await updateAlert(snoozed);
    setShowSnoozeModal(false);
  };

  /**
   * note: is this still the correct alert context
   * handler for when the eventwrapper saves the event
   * update/expire the alert
   */
  const handleEventSaved = async (): Promise<void> => {
    console.log('workflow saved, UserAlertPage handleEventSaved called with event', selectedAlert);
    if (!selectedAlert) {
      return;
    }
    selectedAlert.expireAlert();
    await updateAlert(selectedAlert);
  };

  const propsToShow = [...MortalityAlert.displayableMortalityAlertProps, 'update', 'Snooze Status', 'Snooze Action'];

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }

  // todo: use existing table
  return (
    <div className={'container'}>
      <Box p={1}>
        {/* is the alert being updated? */}
        {isLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper} style={{ padding: '3px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {propsToShow.map((str, idx) => (
                    <TableCell key={idx}>{columnToHeader(str)}</TableCell>
                  ))}
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
                      <TableCell>{formatT(a.valid_from)}</TableCell>
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
        <WorkflowWrapper
          event={(selectedAlert as MortalityAlert).toMortalityEvent()}
          open={showEventModal}
          handleClose={(): void => setShowEventModal(false)}
          onEventSaved={handleEventSaved}
        />
      ) : null}
    </div>
  );
}
