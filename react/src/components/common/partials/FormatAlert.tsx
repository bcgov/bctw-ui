import { Box, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { Icon } from 'components/common';
import { getTag } from 'components/table/table_helpers';
import { MortalityAlert, TelemetryAlert } from 'types/alert';
import { eDeviceStatus } from 'types/collar';
import { formatT } from 'utils/time';

interface FormattedAlertProps {
  alert: TelemetryAlert;
  format: 'banner' | 'menu' | 'page';
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
  return null;
  // if (alert instanceof MortalityAlert && format === 'page') {
  // }
};
