import { Box, Grid, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { Icon } from 'components/common';
import { getTag } from 'components/table/table_helpers';
import { eAlertType, MortalityAlert, TelemetryAlert } from 'types/alert';
import { eDeviceStatus } from 'types/collar';
import { formatT } from 'utils/time';
import makeStyles from '@mui/styles/makeStyles';

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
  if(tAlert instanceof MortalityAlert) {
      switch(tAlert.alert_type) {
          case eAlertType.mortality:
              return `Device ID ${tAlert.device_id} has detected a potential mortality.`
          case eAlertType.malfunction:
              return `Device ID ${tAlert.device_id} is self-reporting a device malfunction.`
          case eAlertType.battery:
              return `The battery for the device with Device ID ${tAlert.device_id} is running low.`
          default:
              return "Unsupported Telemetry Type";
      }
  }
  return "";
}

const getTitleText = (tAlert: TelemetryAlert) => {
  if(tAlert instanceof MortalityAlert) {
      switch(tAlert.alert_type) {
          case eAlertType.mortality:
              return (<>Potential <b><u>Mortality</u></b> Alert</>);
          case eAlertType.malfunction:
              return (<>Potential Malfunction Alert</>);
          case eAlertType.battery:
              return (<>Low Battery Alert</>)
          default:
              return (<></>);
      }
  }
  else {
      return (<>Unknown Telemetry Alert</>)
  }
}
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
  if (alert instanceof MortalityAlert && format === 'menu') {
    return (
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
    );
  }
  if (alert instanceof MortalityAlert && format === 'banner') {
    return (
      <ListItem>
        <ListItemIcon sx={{ pr: 2 }}>{getTag(alert.device_status as eDeviceStatus, null, 'error')}</ListItemIcon>
        <ListItemText
          primary={
            <Typography>
              The status of <b>Device ID:</b> {alert.device_id} changed from 'Alive' to '<b>{alert.device_status}</b>'
              on {formatT(alert.valid_from)}
            </Typography>
          }
          secondary={
            <>
              <b>Animal ID:</b> {alert.animal_id} <b>WLH ID:</b> {alert.wlh_id}
            </>
          }
        />
      </ListItem>
    );
  }
  if(alert instanceof MortalityAlert && format === 'page') {
    return (
      <>
      <Box display={'flex'} justifyContent={'space-between'}>
          <Typography>{getTitleText(alert)}</Typography>
          <Typography textAlign={'right'}> {`${alert.valid_from.format("hh:mm a")}`}</Typography>
      </Box> 
      {alert instanceof MortalityAlert && (
          <>

              <Typography className={styles.spacing}>{getCustomBodyText(alert)}</Typography>
              <Grid container columnGap={2}>
                  <Grid item>
                      <Typography className={styles.spacing}>
                      {`Species: ${alert.species}`}
                      </Typography>
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
      </>
    );
  }
  return null;
};
