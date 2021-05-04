import { useContext, useEffect, useState } from 'react';
import { TableHead, Typography } from '@material-ui/core';
import { TelemetryAlert } from 'types/alert';
import { AlertContext } from 'contexts/UserAlertContext';
import { TableRow, TableCell, TableBody, Table, Box, TableContainer, Paper } from '@material-ui/core';
import Button from 'components/form/Button';
import { dateObjectToTimeStr } from 'utils/time';
import EditModal from 'pages/data/common/EditModal';

export default function AlertPage(): JSX.Element {
  const useAlerts = useContext(AlertContext);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<TelemetryAlert>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  useEffect(() => {
    const update = (): void => {
      setAlerts(useAlerts?.alerts);
    };
    update();
  }, [useAlerts]);

  if (!alerts?.length) {
    return <div>no alerts</div>;
  }

  const setShowModal = (): void => setShowUpdateModal((o) => !o);

  const handleSelectRow = (aid: number): void => {
    console.log(aid);
    setSelectedAlert(alerts.find((a) => a.alert_id === aid));
  };

  const fieldsMortality = ['animal_status', 'collar_status'];
  const fieldsBattery = ['device_malfunction_type', 'collar_status']; //malfunction_date??

  const createModal = ():JSX.Element => {
    return (
      <EditModal<TelemetryAlert>
        handleClose={setShowUpdateModal}
        onSave={null}
        editing={selectedAlert}
        open={showUpdateModal}
        newT={new TelemetryAlert()}
        isEdit={false}>
        <form className='rootEditInput'>
        </form>
      </EditModal>
    )
  }

  const display = [
    'wlh_id',
    'animal_id',
    'device_id',
    'Make',
    'device_status',
    'animal_status',
    'alert_type',
    'valid_from'
  ];
  return (
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
                    <TableCell style={{color: 'red'}}><strong>{a.formatAlert}</strong></TableCell>
                    <TableCell>{dateObjectToTimeStr(a.valid_from)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <div className={'admin-btn-row'}>
        <Button disabled={!selectedAlert} onClick={setShowModal}>update alert status</Button>
      </div>
      {createModal()}
    </div>
  );
}