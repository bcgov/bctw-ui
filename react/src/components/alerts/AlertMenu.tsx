import {
  Badge,
  Box,
  Container,
  Divider,
  IconButton,
  lighten,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import { Icon } from 'components/common';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { useEffect, useState } from 'react';
import { TelemetryAlert } from 'types/alert';
import { ArrowButton } from '../common/partials/ArrowButton';
import { FormatAlert } from './FormatAlert';
import { SubHeader } from '../common/partials/SubHeader';
import ViewAllAlerts from 'components/alerts/ViewAllAlerts';
import { isToday } from 'utils/time';

interface NotificationsMenuProps {
  alerts?: TelemetryAlert[];
}
/**
 * @param alerts TelemetryAlerts array
 * Returns JSX.Element menu object with bell + badge icon
 * Badge shows the current number of alerts in the alerts array
 */
export const AlertMenu = ({ alerts }: NotificationsMenuProps): JSX.Element => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showingAlerts, setShowingAlerts] = useState(false);
  const [menuAlerts, setMenuAlerts] = useState([]);
  const open = Boolean(anchorEl);
  const setAnchor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    //Display only the valid alerts in the menu
    //Alert page shows all alerts including soft deleted records.
    setMenuAlerts(alerts?.filter((a) => !a.valid_to.isValid()));
  }, [alerts]);
  return (
    <>
      <Box mr={2}>
        <IconButton onClick={setAnchor}>
          <Badge badgeContent={menuAlerts?.length} color={'error'} overlap={'circular'}>
            <Icon icon={'bell'} />
          </Badge>
        </IconButton>
      </Box>
      <Menu
        id={`notifications-menu}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '&& .Mui-selected': {
            backgroundColor: lighten(theme.palette.error.light, 0.9)
          }
        }}>
        <ListItem>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <SubHeader text={'Alerts'} />
            <ArrowButton size={'large'} label={'See Alert History'} onClick={() => setShowingAlerts(true)} />
          </Box>
        </ListItem>
        <Divider />
        {menuAlerts.map((notif, idx) => (
          // Highlight all un-handled (active) alerts
          <Box key={`menu-item-${idx}`}>
            <MenuItem sx={{ py: 3 }} divider={idx < alerts?.length} selected={isToday(notif.valid_from)}>
              {!alerts?.length ? (
                <ListItemText primary={'No un-handled alerts to show.'} />
              ) : (
                <FormatAlert format='menu' alert={notif} />
              )}
            </MenuItem>
          </Box>
        ))}
      </Menu>
      <FullScreenDialog open={showingAlerts} handleClose={() => setShowingAlerts(false)}>
        <Container maxWidth='xl'>{<ViewAllAlerts alerts={alerts} />}</Container>
      </FullScreenDialog>
    </>
  );
};
