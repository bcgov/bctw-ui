import { Box, Button, Grid, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from 'components/common';
import MapModal from 'components/modal/MapModal';
import Modal from 'components/modal/Modal';
import { getTag } from 'components/table/table_helpers';
import UserAlertPage from 'pages/user/UserAlertPage';
import { useState } from 'react';
import { eAlertType, MortalityAlert, TelemetryAlert } from 'types/alert';
import { eDeviceStatus } from 'types/collar';
import { formatT } from 'utils/time';

interface FormattedAlertProps {
  alert: TelemetryAlert;
  format: 'banner' | 'menu' | 'page';
}

const useStyles = makeStyles((theme) => ({
  spacing: {
    marginTop: theme.spacing(1)
  }
}));

const getCustomBodyText = (tAlert: TelemetryAlert): string => {
  if (tAlert instanceof MortalityAlert) {
    switch (tAlert.alert_type) {
      case eAlertType.mortality:
        return `Device ID ${tAlert.device_id} has detected a potential mortality.`;
      case eAlertType.malfunction:
        return `Device ID ${tAlert.device_id} is self-reporting a device malfunction.`;
      case eAlertType.battery:
        return `The battery for the device with Device ID ${tAlert.device_id} is running low.`;
      default:
        return 'Unsupported Telemetry Type';
    }
  }
  return '';
};

const getTitleText = (tAlert: TelemetryAlert) => {
  if (tAlert instanceof MortalityAlert) {
    switch (tAlert.alert_type) {
      case eAlertType.mortality:
        return (
          <>
            Potential{' '}
            <b>
              <u>Mortality</u>
            </b>{' '}
            Alert
          </>
        );
      case eAlertType.malfunction:
        return <>Potential Malfunction Alert</>;
      case eAlertType.battery:
        return <>Low Battery Alert</>;
      default:
        return <></>;
    }
  } else {
    return <>Unknown Telemetry Alert</>;
  }
};
/**
 * Formats the inner html for the different alerts that are shown throughout the system
 * @param alert TelemetryAlert -> MortalityAlert / MalfunctionAlert
 * @param format The type styling for the alert
 * Returns inner html for an alert
 *
 */
export const FormatAlert = ({ alert, format }: FormattedAlertProps): JSX.Element => {
  const theme = useTheme();
  const styles = useStyles();
  const [openMap, setOpenMap] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);

  if (alert instanceof MortalityAlert) {
    <UserAlertPage />;
    return (
      <>
        {format === 'menu' && (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <ListItemIcon>
              <Icon icon={'circle'} htmlColor={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography>
                  {`${alert.species} Mortality alert for Device ${alert.device_id} on Animal ${alert.wlh_id}`}
                </Typography>
              }
              secondary={`${alert.valid_from}`}
            />
          </Box>
        )}
        {format === 'banner' && (
          <Box minWidth={'100%'}>
            <ListItem>
              <ListItemIcon sx={{ pr: 2 }}>{getTag(alert.device_status as eDeviceStatus, null, 'error')}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography>
                    The status of <b>Device ID:</b> {alert.device_id} changed from 'Alive' to '
                    <b>{alert.device_status}</b>' on {formatT(alert.valid_from)}
                  </Typography>
                }
                secondary={
                  <>
                    <b>Animal ID:</b> {alert.animal_id} <b>WLH ID:</b> {alert.wlh_id}
                  </>
                }
              />
              <Button variant={'contained'} onClick={() => setOpenMap(true)}>
                View on Map
              </Button>
            </ListItem>
            <Button sx={{ float: 'right' }} color={'inherit'} onClick={() => setOpenWorkflow(true)}>
              Update Mortality
            </Button>
          </Box>
        )}
        {format === 'page' && (
          <>
            <Box display={'flex'} justifyContent={'space-between'}>
              <Typography>{getTitleText(alert)}</Typography>
              <Typography textAlign={'right'}> {`${alert.valid_from.format('hh:mm a')}`}</Typography>
            </Box>

            <Typography className={styles.spacing}>{getCustomBodyText(alert)}</Typography>
            <Grid container columnGap={2}>
              <Grid item>
                <Typography className={styles.spacing}>{`Species: ${alert.species}`}</Typography>
              </Grid>
              <Grid item>
                <Typography className={styles.spacing}>
                  {`Animal ID: ${alert.animal_id.length ? alert.animal_id : 'None'}`}
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={styles.spacing}>
                  {`Wildlife Health ID: ${alert.wlh_id.length ? alert.wlh_id : 'None'}`}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
        <MapModal
          open={openMap}
          handleClose={() => setOpenMap(false)}
          width={'600px'}
          height={'500px'}
          critter_id={alert.critter_id}
        />
        <Modal title={'Current Alerts'} open={openWorkflow} handleClose={() => setOpenWorkflow(false)}>
          <UserAlertPage />
        </Modal>
      </>
    );
  }
  return null;
};
