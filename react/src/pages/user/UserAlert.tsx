import { useContext, useEffect, useState } from 'react';
import { IconButton, TableHead, Typography } from '@material-ui/core';
import { TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import { dateObjectToTimeStr } from 'utils/time';
import EditModal from 'pages/data/common/EditModal';
import { Icon } from 'components/common';
import ConfirmModal from 'components/modal/ConfirmModal';
import { UserAlertStrings } from 'constants/strings';
import ModifyAlertWrapper from './ModifyAlertWrapper';
import EditMortalityEvent from 'pages/data/events/MortalityEvent';

export default function AlertPage(): JSX.Element {
  const useAlerts = useContext(AlertContext);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<TelemetryAlert>(null);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [showDismissModal, setShowDismissModal] = useState<boolean>(false);

  useEffect(() => {
    const update = (): void => {
      setAlerts(useAlerts?.alerts);
    };
    update();
  }, [useAlerts]);

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }

  const handleSelectRow = (aid: number): void => {
    console.log(aid);
    setSelectedAlert(alerts.find((a) => a.alert_id === aid));
  };

  const handleConfirmDismiss = (row: TelemetryAlert): void => {
    console.log(row);
  };

  const onDelete = () => {
    console.log('hi im del', selectedAlert)

  }

  const display = [
    'WLH ID',
    'animal_id',
    'device_id',
    'Make',
    'device_status',
    'animal_status',
    'alert_type',
    'valid_from',
    'perform action',
    'dismiss'
  ];
  return (
    <ModifyAlertWrapper alert={selectedAlert}>
      <div className={'container'}>
        <Typography variant='h4'>Alerts</Typography>
        <Box p={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {display.map((str, idx) => {
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
                      <TableCell>{a.device_status}</TableCell>
                      <TableCell>{a.animal_status}</TableCell>
                      <TableCell style={{ color: 'red' }}>
                        <strong>{a.formatAlert}</strong>
                      </TableCell>
                      <TableCell>{dateObjectToTimeStr(a.valid_from)}</TableCell>
                      <TableCell>
                        <IconButton onClick={(): void => setShowActionModal(true)}>
                          <Icon icon='edit' />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={onDelete}>
                          <Icon icon='close' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <ConfirmModal
          handleClickYes={handleConfirmDismiss}
          handleClose={(): void => setShowDismissModal(false)}
          message={UserAlertStrings.dimissAlert}
          open={showDismissModal}
        />
        <EditMortalityEvent alert={selectedAlert ?? new TelemetryAlert()} open={showActionModal} handleClose={(): void => setShowActionModal(false)} />
      </div>
    </ModifyAlertWrapper>
  );
}
