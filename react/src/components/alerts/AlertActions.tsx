import { Box, Button } from '@mui/material';
import { AxiosError } from 'axios';
import { Icon, Modal, Tooltip } from 'components/common';
import SimpleMap from 'components/common/SimpleMap';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import dayjs from 'dayjs';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import WorkflowWrapper from 'pages/data/events/WorkflowWrapper';
import { useEffect, useState } from 'react';
import { MalfunctionAlert, MortalityAlert, TelemetryAlert, eAlertType } from 'types/alert';
import { SuperWorkflow } from 'types/events/event';
import MalfunctionEvent from 'types/events/malfunction_event';
import MortalityEvent from 'types/events/mortality_event';
import { pluralize } from 'utils/common_helpers';
import { formatAxiosError } from 'utils/errors';
// import { UserContext } from 'contexts/UserContext';
// import { eCritterPermission } from 'types/permission';

/**
 * modal component that shows current alerts
 * todo: use an existing table component
 */
interface AlertActionsProps {
  alert: MalfunctionAlert | MortalityAlert;
  showActions?: { map?: boolean; edit?: boolean; snooze?: boolean };
}
/**
 * @param alert Type of alert, currently only handling Malfunctions / Mortalities
 * @param showActions Optional object to enable specific btns. No prop defaults to all
 * Only handling 'Show on Map', 'Edit Alert' (Do appropriate workflow i.e: Mortality Workflow), 'Snooze' (Disable alert for 1 day)
 */
export default function AlertActions({ alert, showActions }: AlertActionsProps): JSX.Element {
  const api = useTelemetryApi();

  const showNotif = useResponseDispatch();
  //const useAlerts = useContext(AlertContext);
  // const useUser = useContext(UserContext);
  // const eCritters = api.useCritterAccess(1, { user: useUser.user, filter: [eCritterPermission.editor] });
  //const [alerts, setAlerts] = useState<MortalityAlert[]>([]);

  //const [selectedAlert, setSelectedAlert] = useState<MortalityAlert | MalfunctionAlert | null>(null);
  // display status of the modal that the user can perform the alert update from
  const [showEventModal, setShowEventModal] = useState(false);
  // display status of the modal that requires the user to confirm snoozing
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [snoozeMessage, setSnoozeMessage] = useState('');
  const [openMap, setOpenMap] = useState(false);
  // when an alert row is selected, clicking the 'update' button will trigger a workflow modal based on the alert type
  const [workflow, createWorkflow] = useState<SuperWorkflow | null>(null);
  const isMortality = alert.alert_type === eAlertType.mortality;
  /**
   * when a new alert is passed as props:
   * a) update the workflow state
   * note: for malfunction events: default the date to last_transmission
   */
  useEffect(() => {
    if (alert) {
      createWorkflow(() => {
        const n = alert.toWorkflow(
          isMortality ? new MortalityEvent(alert.valid_from) : new MalfunctionEvent(alert.last_transmission_date)
        );
        return n;
      });
    }
  }, [alert]);

  // useEffect(() => {
  //   const update = (): void => {
  //     const alerts = useAlerts?.alerts;
  //     if (alerts?.length) {
  //       setAlerts(alerts);
  //     }
  //   };
  //   update();
  // }, [useAlerts]);

  const onSuccess = async (): Promise<void> => {
    showNotif({ severity: 'success', message: `telemetry alert saved` });
  };

  const onError = (error: AxiosError): void => showNotif({ severity: 'error', message: formatAxiosError(error) });

  // setup the mutation to update the alert status
  const { mutateAsync } = api.useSaveUserAlert({ onSuccess, onError });

  const isManager = (alert: MortalityAlert): boolean => alert.permission_type === 'manager';

  // const handleSelectRow = (aid: number): void => {
  //   //const selected = alerts.find((a) => a.alert_id === aid);
  //   setSelectedAlert(selected);
  //   const type = selected.alert_type;
  //   createWorkflow(() => {
  //     const n = selected.toWorkflow(
  //       type === eAlertType.malfunction
  //         ? new MalfunctionEvent(selected.last_transmission_date)
  //         : new MortalityEvent(selected.valid_from)
  //     );
  //     return n;
  //   });
  // };

  // post the updated alert
  const updateAlert = async (alert: TelemetryAlert): Promise<void> => {
    await mutateAsync([alert.toJSON()]);
  };

  // user selected to take action on the alert, show the update modal
  const editAlert = (): void => {
    //setSelectedAlert(row);
    setShowEventModal(true);
  };

  // make user confirm the snooze action
  const handleClickSnooze = (): void => {
    setSnoozeMessage(UserAlertStrings.snoozeConfirmation(alert.snoozesMax - alert.snooze_count));
    //setSelectedAlert(alert);
    setShowSnoozeModal(true);
  };

  // when the snooze action is confirmed, update the snooze and save the alert
  const handleConfirmSnooze = async (): Promise<void> => {
    const snoozed = Object.assign(new TelemetryAlert(), alert);
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
    if (!alert) {
      return;
    }
    alert.expireAlert();
    await updateAlert(alert);
    setShowEventModal(false);
  };

  // const propsToShow = [
  //   ...MortalityAlert.displayableMortalityAlertProps,
  //   'permission_type',
  //   'update',
  //   'status',
  //   'snooze'
  // ];

  // if (!alerts?.length) {
  //   return <div>no alerts</div>;
  // }

  return (
    <div>
      {/* <InfoBanner text={UserAlertStrings.alertText} /> */}
      {/* <NotificationBanner
        hiddenContent={alerts.map((alert) => (
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <FormatAlert alert={alert} format='banner' />
            <div>hi</div>
          </Box>
        ))}
      /> */}
      {/* Map Btn */}
      <Box display='flex' alignItems='center'>
        {isManager && (
          <>
            {/* Edit btn */}

            {(!showActions || showActions?.edit) && (
              <Button
                sx={{ mr: 1, minWidth: '9rem' }}
                variant={'contained'}
                size={'small'}
                color={'secondary'}
                onClick={(): void => editAlert()}>
                {isMortality ? 'Report Mortality' : 'Handle Malfunction'}
              </Button>
            )}

            {/* Snooze Btn */}

            {(!showActions || showActions?.snooze) && (
              <Tooltip title={`${alert.snoozesAvailable} ${pluralize(alert.snoozesAvailable, 'snooze')} left`}>
                <Button
                  variant='outlined'
                  sx={{ mr: 1 }}
                  onClick={(): void => handleClickSnooze()}
                  size={'small'}
                  endIcon={<Icon icon='snooze' size={0.9} />}>
                  Snooze
                </Button>
              </Tooltip>
            )}
          </>
        )}
        {(!showActions || showActions?.map) && (
          <Button
            sx={{ mr: 1 }}
            variant={'contained'}
            size={'small'}
            color={'primary'}
            onClick={(): void => setOpenMap(true)}>
            Map
          </Button>
        )}
      </Box>

      {/* {isManager && (
        <Button variant={'contained'} size={'small'} color={'secondary'} onClick={(): void => handleClickSnooze()}>
          Snooze
        </Button>
      )} */}

      {/* <Box py={1}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
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
                      <TableCell>{a.taxon}</TableCell>
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
      </Box> */}

      <Modal open={openMap} handleClose={() => setOpenMap(false)}>
        <SimpleMap
          divID={'alertMap'}
          height={'500px'}
          width={'500px'}
          startDate={alert.valid_from?.subtract(24, 'weeks') ?? dayjs().subtract(24, 'weeks')}
          endDate={alert.valid_from ?? dayjs()}
          critter_id={alert.critter_id}
        />
      </Modal>
      <ConfirmModal
        handleClickYes={handleConfirmSnooze}
        handleClose={(): void => setShowSnoozeModal(false)}
        message={snoozeMessage}
        open={showSnoozeModal}
      />
      {workflow ? (
        <WorkflowWrapper
          event={workflow}
          open={showEventModal}
          handleClose={(): void => setShowEventModal(false)}
          onEventSaved={handleEventSaved}
        />
      ) : null}
    </div>
  );
}
