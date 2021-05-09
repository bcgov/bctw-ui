import { useContext, useEffect, useState } from 'react';
import { CircularProgress, IconButton, TableHead, Typography } from '@material-ui/core';
import { ITelemetryAlertInput, TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import { dateObjectToTimeStr } from 'utils/time';
import { Icon } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import MortalityEventForm from 'pages/data/events/MortalityEventForm';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useResponseDispatch } from 'contexts/ApiResponseContext';
import { formatAxiosError } from 'utils/common';
import { AxiosError } from 'axios';
import { IBulkUploadResults, IUpsertPayload } from 'api/api_interfaces';
import { Animal } from 'types/animal';
import { Collar } from 'types/collar';

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

  const onDismissSuccess = async (): Promise<void> => {
    // responseDispatch({ type: 'success', message: `telemetry alert dismissed` });
  };

  const onSuccess = async (data: IBulkUploadResults<Animal | Collar>): Promise<void> => {
    console.log('data returned from mortality alert context', data);
    const { errors, results } = data;
    if (errors.length) {
      responseDispatch({ type: 'error', message: `${errors.map((e) => e.error)}` });
    } else {
      responseDispatch({ type: 'success', message: 'event saved!' });
    }
    if ((results as Collar[])[0]?.collar_id) {
      // only refetch if sucessful
      await updateAlert();
    }
  };

  const onError = (error: AxiosError): void => responseDispatch({ type: 'error', message: formatAxiosError(error) });

  // setup the mutations for saving critters, collars, and updating the alert
  const { mutateAsync: saveAlert, isLoading: isSavingAlert } = bctwApi.useMutateUserAlert({
    onSuccess: onDismissSuccess,
    onError
  });
  const { mutateAsync: saveCritter } = bctwApi.useMutateCritter({ onSuccess, onError });
  const { mutateAsync: saveCollar } = bctwApi.useMutateCollar({ onSuccess, onError });

  const handleSelectRow = (aid: number): void => {
    const selected = alerts.find((a) => a.alert_id === aid);
    setSelectedAlert(selected);
  };


  const handleSave = async (animal: Animal, collar: Collar): Promise<void> => {
    responseDispatch({ type: 'error', message: `not enabled yet!` });
    return;
    if (animal && animal.critter_id) {
      // console.log('critter payload', animal);
      const b: IUpsertPayload<Animal> = { body: animal, isEdit: true };
      await saveCritter(b);
    }
    if (collar && collar.collar_id) {
      // console.log('collar payload', collar);
      const b: IUpsertPayload<Collar> = { body: collar, isEdit: true };
      await saveCollar(b);
    }
  };

  const editAlert = (row: TelemetryAlert): void => {
    setSelectedAlert(row);
    setShowUpdateModal(true);
  };

  const updateAlert = async (): Promise<void> => {
    responseDispatch({ type: 'error', message: `snoozing not enabled yet!` });
    return;
    const payload: ITelemetryAlertInput = {
      alert_ids: [selectedAlert?.alert_id],
      alert_action: 'dismiss'
    };
    await saveAlert(payload);
    // trigger context to reload alerts
    useAlerts.invalidate();
  };

  // show the modal that requires the user to confirm the snooze action
  const handleClickSnooze = (alert: TelemetryAlert): void => {
    setSnoozeMessage(UserAlertStrings.snoozeConfirmation(alert.snoozesMax - alert.snooze_count));
    setSelectedAlert(alert);
    setShowSnoozeModal(true);
  };

  // when the user clicks 'yes' in the confirmation modal
  const handleConfirmSnooze = (): void => {
    updateAlert();
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
    'Snooze Count',
    'Snooze'
  ];

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }
  return (
    <div className={'container'}>
      <Typography variant='h4'>Alerts</Typography>
      <Box p={3}>
        {isSavingAlert ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
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
                      <TableCell>{a.isSnoozed ? 'Snoozed' : 'Not Snoozed'}</TableCell>
                      <TableCell>{a.snooze_count}</TableCell>
                      <TableCell>
                        {a.isSnoozed ? null : a.snooze_count < 3 ? (
                          <IconButton onClick={(): void => handleClickSnooze(a)}>
                            <Icon icon='snooze' />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(): void =>
                              responseDispatch({ type: 'error', message: 'no more snoozes available!' })
                            }>
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
