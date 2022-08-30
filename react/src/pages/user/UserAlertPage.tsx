import { useContext, useEffect, useState } from 'react';
import { CircularProgress, IconButton, TableHead } from '@mui/material';
import { eAlertType, MalfunctionAlert, MortalityAlert, TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@mui/material';
import { formatT } from 'utils/time';
import { Icon } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { formatAxiosError } from 'utils/errors';
import { AxiosError } from 'axios';
import { capitalize, columnToHeader } from 'utils/common_helpers';
import WorkflowWrapper from 'pages/data/events/WorkflowWrapper';
import MortalityEvent from 'types/events/mortality_event';
import MalfunctionEvent from 'types/events/malfunction_event';
import { BCTWWorkflow, IBCTWWorkflow } from 'types/events/event';
// import { UserContext } from 'contexts/UserContext';
// import { eCritterPermission } from 'types/permission';

/**
 * modal component that shows current alerts
 * todo: use an existing table component
 */
export default function AlertPage(): JSX.Element {
  const api = useTelemetryApi();

  const showNotif = useResponseDispatch();
  const useAlerts = useContext(AlertContext);
  // const useUser = useContext(UserContext);
  // const eCritters = api.useCritterAccess(1, { user: useUser.user, filter: [eCritterPermission.editor] });
  const [alerts, setAlerts] = useState<MortalityAlert[]>([]);

  const [selectedAlert, setSelectedAlert] = useState<MortalityAlert | MalfunctionAlert | null>(null);
  // display status of the modal that the user can perform the alert update from
  const [showEventModal, setShowEventModal] = useState(false);
  // display status of the modal that requires the user to confirm snoozing
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeMessage, setSnoozeMessage] = useState('');
  // when an alert row is selected, clicking the 'update' button will trigger a workflow modal based on the alert type
  const [workflow, createWorkflow] = useState<IBCTWWorkflow | null>(null);

  useEffect(() => {
    const update = (): void => {
      const alerts = useAlerts.alerts;
      setAlerts(alerts);
    };
    update();
  }, [useAlerts]);

  const onSuccess = async (): Promise<void> => {
    showNotif({ severity: 'success', message: `telemetry alert saved` });
  };

  const onError = (error: AxiosError): void => showNotif({ severity: 'error', message: formatAxiosError(error) });

  // setup the mutation to update the alert status
  const { mutateAsync, isLoading } = api.useSaveUserAlert({ onSuccess, onError });

  const isEditor = (alert: MortalityAlert): boolean => alert.permission_type === 'editor';

  /**
   * when an alert row is selected from the table:
   * a) set the selected row state
   * b) based on the alert type, update the workflow state
   *
   * for malfunction events: default the date to last_transmission
   */
  const handleSelectRow = (aid: number): void => {
    const selected = alerts.find((a) => a.alert_id === aid);
    setSelectedAlert(selected);
    const type = selected.alert_type;
    createWorkflow(() => {
      const n = selected.toWorkflow(
        type === eAlertType.malfunction
          ? new MalfunctionEvent(selected.last_transmission_date)
          : new MortalityEvent(selected.valid_from)
      );
      return n;
    });
  };

  // post the updated alert
  const updateAlert = async (alert: TelemetryAlert): Promise<void> => {
    await mutateAsync([alert.toJSON()]);
  };

  // user selected to take action on the alert, show the update modal
  const editAlert = (row): void => {
    setSelectedAlert(row);
    setShowEventModal(true);
  };

  // make user confirm the snooze action
  const handleClickSnooze = (alert): void => {
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
    //console.log('workflow saved, UserAlertPage handleEventSaved called with event', selectedAlert);
    if (!selectedAlert) {
      return;
    }
    selectedAlert.expireAlert();
    await updateAlert(selectedAlert);
    setShowEventModal(false);
  };

  const propsToShow = [
    ...MortalityAlert.displayableMortalityAlertProps,
    'permission_type',
    'update',
    'status',
    'snooze'
  ];

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }

  return (
    <div className={'container'}>
      <Box>{UserAlertStrings.alertText}</Box>
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
                    <TableCell key={idx}>
                      {alerts.length ? alerts[0].formatPropAsHeader(str) : columnToHeader(str)}
                    </TableCell>
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
                      <TableCell>{a.species}</TableCell>
                      <TableCell>{a.device_id}</TableCell>
                      <TableCell>{a.device_make}</TableCell>
                      <TableCell style={{ color: 'orangered' }}>
                        <strong>{a.formatAlert}</strong>
                      </TableCell>
                      <TableCell>{formatT(a.valid_from)}</TableCell>
                      <TableCell>
                        {a.last_transmission_date.isValid() ? formatT(a.last_transmission_date) : ''}
                      </TableCell>
                      <TableCell>{capitalize(a.permission_type)}</TableCell>
                      <TableCell>
                        {!isEditor(a) ? (
                          <IconButton
                            style={{ padding: '9px', backgroundColor: 'orangered' }}
                            onClick={(): void => editAlert(a)}
                            size='large'>
                            <Icon icon='edit' htmlColor='#fff' />
                          </IconButton>
                        ) : (
                          <p>N/A</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.snooze_count === a.snoozesMax ? <b>{a.snoozeStatus}</b> : a.snoozeStatus}
                      </TableCell>

                      <TableCell>
                        {!isEditor(a) ? (
                          !a.isSnoozed && a.snoozesAvailable === 0 ? (
                            <IconButton disabled={true} size='large'>
                              <Icon icon='warning' htmlColor='orange'></Icon>
                            </IconButton>
                          ) : a.isSnoozed ? null : a.snoozesAvailable > 0 ? (
                            <IconButton onClick={(): void => handleClickSnooze(a)} size='large'>
                              <Icon icon='snooze' />
                            </IconButton>
                          ) : (
                            <IconButton disabled={true} size='large'>
                              <Icon icon='cannotSnooze' />
                            </IconButton>
                          )
                        ) : (
                          <p>N/A</p>
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
          event={workflow as BCTWWorkflow<typeof workflow>}
          open={showEventModal}
          handleClose={(): void => setShowEventModal(false)}
          onEventSaved={handleEventSaved}
        />
      ) : null}
    </div>
  );
}
