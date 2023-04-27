import { Box, Button, Grid, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Icon } from 'components/common';
import MapModal from 'components/modal/MapModal';
import Modal from 'components/modal/Modal';
import { getTag } from 'components/table/table_helpers';
import dayjs from 'dayjs';

import { useState } from 'react';
import { eAlertType, MalfunctionAlert, MortalityAlert, TelemetryAlert } from 'types/alert';
import { eDeviceStatus } from 'types/collar';
import { capitalize } from 'utils/common_helpers';
import { formatT, getDaysDiff } from 'utils/time';
import AlertActions from './AlertActions';
import { AlertIcon } from './AlertIcon';

interface FormattedAlertProps {
  alert: TelemetryAlert;
  format: 'banner' | 'menu' | 'page';
}

const useStyles = makeStyles((theme) => ({
  spacing: {
    marginTop: theme.spacing(1)
  }
}));

export const getTitle = (tAlert: TelemetryAlert) => {
  const title = tAlert.alert_type;
  switch (title) {
    case eAlertType.mortality:
      return `Potential ${capitalize(title)}`;
    case eAlertType.malfunction:
      return `Device ${capitalize(title)}`;
    case eAlertType.battery:
      return `Low ${capitalize(title)} Status`;
    default:
      return `unknown alert`;
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
  const styles = useStyles();
  const [openMap, setOpenMap] = useState(false);
  const isManager = (alert: MortalityAlert): boolean => alert.permission_type === 'manager';
  if (alert instanceof MortalityAlert || alert instanceof MalfunctionAlert) {
    const HEADER = (
      <Typography>
        {`Device ID ${alert.device_id} detected a `}
        <b>
          <u>{getTitle(alert)}</u>
        </b>
        {format !== 'menu' && ` ${getDaysDiff(alert.valid_from).asText}`}
      </Typography>
    );
    return (
      <>
        {format === 'menu' && (
          <Box display={'flex'} justifyContent={'space-between'} flexDirection={'row'} width={'100%'}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <ListItemIcon>{alert.isSnoozed ? <Icon icon={'snooze'} /> : <AlertIcon alert={alert} />}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography>
                    <>
                      {alert.taxon} <b>{getTitle(alert)}</b> alert for Device {alert?.device_id ?? 'Unknown'} on WLH-ID{' '}
                      {alert?.wlh_id ?? 'Unknown'}
                    </>
                  </Typography>
                }
                secondary={
                  <Typography>
                    {
                      <>
                        <b>Alert triggered: </b> {formatT(alert.valid_from)}
                        {alert.isSnoozed && (
                          <>
                            <b> Snoozed to: </b> {formatT(alert.snoozed_to)}
                          </>
                        )}
                      </>
                    }
                  </Typography>
                }
              />
            </Box>
            <Box pl={1}>{isManager && <AlertActions alert={alert} showActions={{ edit: true }} />}</Box>
          </Box>
        )}
        {format === 'banner' && (
          <Box minWidth={'100%'}>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon sx={{ pr: 2 }}>{getTag(capitalize(alert.alert_type), null, 'error')}</ListItemIcon>
              <ListItemText
                primary={
                  <>
                    {/* <Typography>{`${getCustomBodyText(alert)} ${getDaysDiff(alert.valid_from).asText}.`}</Typography> */}
                    {HEADER}
                    <Typography fontWeight='bold'>
                      {isManager
                        ? `Do you want to update this Animals mortality?`
                        : 'Only the Manager of this animal can report a mortality.'}
                    </Typography>
                  </>
                }
                secondary={
                  <>
                    <b>Alert Date:</b> {formatT(alert.valid_from)} <b> Critter ID:</b> {alert?.animal_id ?? 'None'}{' '}
                    <b>WLH ID:</b> {alert?.wlh_id ?? 'None'}
                  </>
                }
              />
              <AlertActions alert={alert} />
            </ListItem>
          </Box>
        )}
        {format === 'page' && (
          <Box display={'flex'} flexDirection='row'>
            <AlertIcon alert={alert} />
            <Box width={'100%'} pl={1}>
              <Box display={'flex'} justifyContent={'space-between'}>
                <Typography variant='h5' pt={0} pb={1} fontWeight='bold'>
                  {getTitle(alert)}
                </Typography>
                <Typography textAlign={'right'}> {`${alert.valid_from.format('hh:mm a')}`}</Typography>
              </Box>
              {HEADER}
              <Grid container columnGap={2}>
                <Grid item>
                  <Typography className={styles.spacing}>{`taxon: ${alert.taxon}`}</Typography>
                </Grid>
                <Grid item>
                  <Typography className={styles.spacing}>{`Critter ID: ${alert?.animal_id ?? 'None'}`}</Typography>
                </Grid>
                <Grid item>
                  <Typography className={styles.spacing}>{`Wildlife Health ID: ${alert?.wlh_id ?? 'None'}`}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
        <MapModal
          open={openMap}
          handleClose={() => setOpenMap(false)}
          width={'600px'}
          height={'500px'}
          startDate={alert.valid_from?.subtract(24, 'weeks') ?? dayjs().subtract(24, 'weeks')}
          endDate={alert.valid_from ?? dayjs()}
          critter_id={alert.critter_id}
        />
        {/* <Modal title={'Current Alerts'} open={openWorkflow} handleClose={() => setOpenWorkflow(false)}>
          <UserAlertPage />
        </Modal> */}
      </>
    );
  }
  return null;
};
